/* eslint-disable import/prefer-default-export */

import { Component } from 'react';

type ParameterComponent =
  Component<{}, { ready: boolean; checklist: { [check: string]: number | undefined } }>;

export function readyToStart(
  component: ParameterComponent,
): boolean {
  const { checklist } = component.state;

  const ready = Object.values(checklist).every((value): boolean => value !== undefined);

  if (ready) component.setState({ ready });
  return ready;
}
