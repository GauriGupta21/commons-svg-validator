export function generateOptimizationReport(
  content: string
) {

  const pathCount =
    (content.match(/<path/gi) || [])
      .length;

  const groupCount =
    (content.match(/<g/gi) || [])
      .length;

  const imageCount =
    (content.match(/<image/gi) || [])
      .length;

  const textCount =
    (content.match(/<text/gi) || [])
      .length;

  const defsCount =
    (content.match(/<defs/gi) || [])
      .length;

  const metadataPresent =
    /<metadata/i.test(content);

  let estimatedOptimizationPercent = 0;

  if (metadataPresent) {
    estimatedOptimizationPercent += 5;
  }

  if (pathCount > 1000) {
    estimatedOptimizationPercent += 10;
  }

  if (groupCount > 100) {
    estimatedOptimizationPercent += 5;
  }

  if (imageCount > 0) {
    estimatedOptimizationPercent += 15;
  }

  if (
    estimatedOptimizationPercent > 100
  ) {
    estimatedOptimizationPercent = 100;
  }

  return {

    pathCount,

    groupCount,

    imageCount,

    textCount,

    defsCount,

    metadataPresent,

    estimatedOptimizationPercent

  };

}