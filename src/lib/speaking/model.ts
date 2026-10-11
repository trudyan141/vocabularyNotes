/** Public files only. This is a download manifest, never a hosted-inference endpoint. */
export const speakingModel = {
  id: 'robg/speako-phoneme-recognizer',
  revision: 'ad0f63cd58fc1bb1e9c261a3b4135997a31c2e58',
  transformersVersion: '3.8.1',
  license: 'Apache-2.0',
  file: 'onnx/model_quantized.onnx',
  bytes: 355216594,
  sha256: '1e03fc69aa5be1f365a94ffa17c060feafdadb626b8a662b7ba6b36cb9f0577e',
  sampleRate: 16000,
  blankId: 41,
} as const;
export const speakingModelFiles = ['config.json', 'preprocessor_config.json', 'vocab.json', speakingModel.file] as const;
export function speakingModelUrl(file: typeof speakingModelFiles[number]): string {
  if (!speakingModelFiles.includes(file)) throw new Error('Unexpected model file');
  return `https://huggingface.co/${speakingModel.id}/resolve/${speakingModel.revision}/${file}`;
}
