import type { TestStep } from "@playwright/test/reporter";
import type { TrendStep } from "./types.js";

/*
 * Helper function to recursively flatten each step into a TrendStep object 
 * This is for step 3 of the onTestEnd() method
 */
export function flattenSteps(steps: TestStep[], level: number = 0): TrendStep[] {
    const result: TrendStep[] = [];

    for (const step of steps) {
        // 1. Convert this current step into a TrendStep object
        const flat: TrendStep = {
            title: step.title,
            durationMs: step.duration,
            level: level,
            category: step.category,
        };
        result.push(flat);

        // 2. If this step has children, recursively flatten them
        if (step.steps.length > 0) {
            const childResults = flattenSteps(step.steps, level + 1);
            result.push(...childResults);
            }
    }

    return result;
}