import { AppiumDriver } from "@bam.tech/appium-helper";
import { TestCase, measurePerformance } from "@perf-profiler/e2e";

const baseBundleId = "com.some.app"; 
const flavor = "flavor"
const bundleId = `${baseBundleId}${flavor}`;

const getTestCases = async () => {
  const driver = await AppiumDriver.create({
    appPackage: bundleId,
    appActivity: `${baseBundleId}.SomeActivity`,
  });

  const scrollTestCase: TestCase = {
    beforeTest: async () => {
      driver.stopApp();
      driver.startApp();
      await driver.clickElementByText("someText");
      await driver.wait(1000)
      await driver.clickElementByText("someText2");
    },
    run: async () => {
      await driver.wait(2000)
      let count = 1
      while (count <= 10) {
        for (let index = 0; index < 10; index++) {
          await driver.scrollUp(2);
        }

        for (let index = 0; index < 10; index++) {
          await driver.scrollDown(2);
        }
        count ++;
      }
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
    1
  );
  writeResults();
});
