import { Logger } from "@perf-profiler/logger";
import { Measure } from "@perf-profiler/types";
import { CpuMeasureAggregator } from "./cpu/CpuMeasureAggregator";
import { processOutput } from "./cpu/getCpuStatsByProcess";
import { processOutput as processRamOutput } from "./ram/pollRamUsage";
import { processOutput as processFpsOutput } from "./gfxInfo/pollFpsUsage";
import { pollPerformanceMeasures as cppPollPerformanceMeasures } from "./cppProfiler";

export const pollPerformanceMeasures = (
  pid: string,
  dataCallback: (data: Measure) => void
) => {
  let initialTime: number | null = null;
  let previousTime: number | null = null;
  let previousJankyFrames = 0;
  let previousTotalFrames = 0;

  const cpuMeasuresAggregator = new CpuMeasureAggregator();
  
  return cppPollPerformanceMeasures(
    pid,
    ({ cpu, ram: ramStr, gfxinfo, timestamp, adbExecTime }) => {
      const subProcessesStats = processOutput(cpu);

      const ram = processRamOutput(ramStr);
      const fps = processFpsOutput(gfxinfo);

      if (initialTime) {
        Logger.debug(`ADB Exec time:${adbExecTime}ms`);
      } else {
        initialTime = timestamp;
      }

      if (previousTime) {
        const interval = timestamp - previousTime;

        const cpuMeasures = cpuMeasuresAggregator.process(
          subProcessesStats,
          interval
        );
        const lines = gfxinfo.split("\n");
        const jankyFramesIndex = lines.findIndex(
          (line) => line.includes('Janky frames:')
        );
        const jankyFramesWithPercentage = lines[jankyFramesIndex].split(':').pop()
        const jankyFrames = jankyFramesWithPercentage?.trim().split(' ')[0]
        const totalFramesIndex = lines.findIndex(
          (line) => line.includes('Total frames rendered')
        );
        const totalFrames = lines[totalFramesIndex].split(':').pop()?.trim()
        const totalFramesToRender = Number(totalFrames) - previousTotalFrames
        const jankyFramesRendered = Number(jankyFrames) - previousJankyFrames

        dataCallback({
          cpu: cpuMeasures,
          fps,
          ram,
          time: timestamp - initialTime,
          totalFramesToRender,
          jankyFrames: jankyFramesRendered,
          renderedFrames: totalFramesToRender - jankyFramesRendered,
          totalFramesTilNow: Number(totalFrames),
          totalJankyFramesTilNow: Number(jankyFrames)
        });
        previousJankyFrames = Number(jankyFrames)
        previousTotalFrames = Number(totalFrames)
      } else {
        cpuMeasuresAggregator.initStats(subProcessesStats);
      }
      previousTime = timestamp;
    }
  );
};
