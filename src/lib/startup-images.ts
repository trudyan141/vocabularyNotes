// CSS device sizes and pixel ratios; assets are generated from our existing Fox.
export const startupDevices=[
 [320,568,2],[375,667,2],[414,736,3],[375,812,3],[360,780,3],
 [390,844,3],[393,852,3],[402,874,3],[414,896,2],[414,896,3],
 [428,926,3],[430,932,3],[440,956,3],[768,1024,2],[810,1080,2],
 [820,1180,2],[834,1194,2],[1024,1366,2],
] as const;
export const startupImages=startupDevices.flatMap(([width,height,ratio])=>['portrait','landscape'].map(orientation=>({
 url:`/startup/fox-${width}x${height}-${ratio}-${orientation}.png`,
 media:`screen and (device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: ${orientation})`,
})));
