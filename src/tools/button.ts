import { CALLBACK_COMMAND } from '@src/enums/callback-command';

export const button = (btn: { text: string; command: CALLBACK_COMMAND; clickReport: string; parameters?: any }) => {
  return {
    text: btn.text,
    callback_data:
      btn.command + ':: ' + btn.clickReport + (btn.parameters ? '::' + JSON.stringify(btn.parameters) : ''),
  };
};

export const extractButtonData = (callbackData) => {
  let [command, clickReport, parameters] = callbackData.split('::');
  if (parameters) parameters = JSON.parse(parameters);
  return { command, clickReport, parameters };
};
