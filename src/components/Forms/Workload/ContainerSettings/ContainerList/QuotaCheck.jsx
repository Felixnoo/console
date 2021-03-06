/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react'
import isEqual from 'react-fast-compare'
import { get, isEmpty } from 'lodash'

import { Alert } from '@kube-design/components'

import {
  getContainersResources,
  compareQuotaAndResources,
} from 'utils/workload'

import styles from './index.scss'

export default class QuotaCheck extends Component {
  state = {
    checkResult: this.getCheckResult(),
  }

  componentDidUpdate(prevProps) {
    if (
      !isEqual(prevProps.containers, this.props.containers) ||
      !isEqual(prevProps.initContainers, this.props.initContainers) ||
      !isEqual(prevProps.leftQuota, this.props.leftQuota)
    ) {
      this.setState({ checkResult: this.getCheckResult() })
    }
  }

  getCheckResult() {
    const { containers, initContainers, leftQuota } = this.props
    const resourcesCost = getContainersResources(containers, initContainers)
    return compareQuotaAndResources(leftQuota, resourcesCost)
  }

  renderOverCostMessage(result) {
    const requestCPUOver = get(result, '["requests.cpu"].overcost')
    const requestMemoryOver = get(result, '["requests.memory"].overcost')
    const limitCPUOver = get(result, '["limits.cpu"].overcost')
    const limitMemoryOver = get(result, '["limits.memory"].overcost')
    return (
      <>
        {(requestCPUOver || requestMemoryOver) && (
          <div className={styles.message}>
            <span>{t('Resource Requests')}:</span>
            {requestCPUOver && (
              <span>
                CPU{t('Cost')}
                {get(result, '["requests.cpu"].cost', t('Not Limited'))}(
                {t('Project Left Quota')}:
                {get(
                  result,
                  '["requests.cpu"].namespaceQuota',
                  t('No Request')
                )}
                ,{t('Workspace Left Quota')}:
                {get(
                  result,
                  '["requests.cpu"].workspaceQuota',
                  t('No Request')
                )}
                )
              </span>
            )}
            {requestMemoryOver && (
              <span>
                {t('Memory')}
                {t('Cost')}
                {get(result, '["requests.memory"].cost', t('Not Limited'))}(
                {t('Project Left Quota')}:
                {get(
                  result,
                  '["requests.memory"].namespaceQuota',
                  t('No Request')
                )}
                ;{t('Workspace Left Quota')}:
                {get(
                  result,
                  '["requests.memory"].workspaceQuota',
                  t('No Request')
                )}
                )
              </span>
            )}
          </div>
        )}
        {(limitCPUOver || limitMemoryOver) && (
          <div className={styles.message}>
            <span>{t('Resource Limits')}:</span>
            {limitCPUOver && (
              <span>
                CPU{t('Cost')}
                {get(result, '["limits.cpu"].cost', t('Not Limited'))}(
                {t('Project Left Quota')}:
                {get(result, '["limits.cpu"].namespaceQuota', t('No Limit'))},
                {t('Workspace Left Quota')}:
                {get(result, '["limits.cpu"].workspaceQuota', t('No Limit'))})
              </span>
            )}
            {limitMemoryOver && (
              <span>
                {t('Memory')}
                {t('Cost')}
                {get(result, '["limits.memory"].cost', t('Not Limited'))}(
                {t('Project Left Quota')}:
                {get(result, '["limits.memory"].namespaceQuota', t('No Limit'))}
                ;{t('Workspace Left Quota')}:
                {get(result, '["limits.memory"].workspaceQuota', t('No Limit'))}
                )
              </span>
            )}
          </div>
        )}
      </>
    )
  }

  renderQuotaMessage(result) {
    return (
      <>
        <div className={styles.message}>
          <span>
            {t('Resource Requests')}: CPU ({t('Project Left Quota')}:
            {get(result, '["requests.cpu"].namespaceQuota', t('No Request'))},
            {t('Workspace Left Quota')}:
            {get(result, '["requests.cpu"].workspaceQuota', t('No Request'))});
          </span>
          <span>
            {t('Memory')} ({t('Project Left Quota')}:
            {get(result, '["requests.memory"].namespaceQuota', t('No Request'))}
            ;{t('Workspace Left Quota')}:
            {get(result, '["requests.memory"].workspaceQuota', t('No Request'))}
            ).
          </span>
        </div>
        <div className={styles.message}>
          <span>
            {t('Resource Limits')}: CPU ({t('Project Left Quota')}:
            {get(result, '["limits.cpu"].namespaceQuota', t('No Limit'))},
            {t('Workspace Left Quota')}:
            {get(result, '["limits.cpu"].workspaceQuota', t('No Limit'))});
          </span>
          <span>
            {t('Memory')} ({t('Project Left Quota')}:
            {get(result, '["limits.memory"].namespaceQuota', t('No Limit'))};
            {t('Workspace Left Quota')}:
            {get(result, '["limits.memory"].workspaceQuota', t('No Limit'))}).
          </span>
        </div>
      </>
    )
  }

  render() {
    const { containers, initContainers } = this.props
    const { checkResult } = this.state

    if (isEmpty(containers) && isEmpty(initContainers)) {
      return null
    }

    const overcost = Object.values(checkResult).some(item => item.overcost)
    const type = overcost ? 'error' : 'info'
    const title = overcost ? t('QUOTA_OVERCOST_TIP') : t('Left Quota')

    const message = overcost
      ? this.renderOverCostMessage(checkResult)
      : this.renderQuotaMessage(checkResult)

    return (
      <Alert
        className="margin-b12"
        type={type}
        title={title}
        message={message}
      />
    )
  }
}
