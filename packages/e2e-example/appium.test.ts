import { AppiumDriver } from "@bam.tech/appium-helper";
import { TestCase, measurePerformance } from "@perf-profiler/e2e";

const bundleId = "com.some.app";

const getTestCases = async () => {
  const driver = await AppiumDriver.create({
    appPackage: bundleId,
    appActivity: `${bundleId}.MainActivity`,
  });

  const scrollTestCase: TestCase = {
    beforeTest: async () => {
      driver.stopApp();
      driver.startApp();
      await driver.clickElementByText("some text 1");
      await driver.clickElementByText("some text 2");
    },
    run: async () => {
      await driver.wait(2000)
      for (let index = 0; index < 5; index++) {
          await driver.scrollUp(2);
      }

      await driver.clickElementById("some text 3");
    },
  };

  return {
    SCROLL: scrollTestCase,
  };
};

test("e2e", async () => {
  const testCases = await getTestCases();

  const { writeResults } = await measurePerformance(
    bundleId,
    testCases.SCROLL,
    2
  );
  writeResults();
});
