# Development Workflow

## 1. Principles
- **Test-Driven Development (TDD):** Always write a failing test before implementing functionality.
- **Surgical Edits:** Make the smallest possible change to achieve the goal.
- **Atomic Commits:** Commit after every completed task.
- **70% Test Coverage:** Maintain at least 70% code coverage for all new features.

## 2. Process
### Phase: Research & Planning
1.  Analyze requirements and existing code.
2.  Identify necessary changes and potential impact.
3.  Draft a detailed implementation plan.

### Phase: Implementation (Iterative)
For each task:
1.  **Plan:** Define the approach and testing strategy.
2.  **Act (TDD):**
    -   Write a failing test case.
    -   Implement the minimum code to pass the test.
    -   Refactor and verify all tests pass.
3.  **Commit:** Stage changes and commit with a descriptive message.
4.  **Summarize:** Record the task summary in **Git Notes**.

### Phase: Verification
1.  Run the full test suite.
2.  Perform manual verification as specified in the track's plan.
3.  Address any regressions or linting issues.

## 3. Communication
-   Provide clear, concise updates after each task.
-   Seek clarification if requirements are ambiguous.
-   Document architectural decisions and trade-offs.

## 4. Phase Completion Verification and Checkpointing Protocol
When a phase is completed, the agent must:
1.  Ensure all tasks in the phase are marked as completed `[x]`.
2.  Verify that all tests related to the phase are passing.
3.  Perform the manual verification steps defined in the `plan.md`.
4.  Commit any remaining changes and push (if applicable).
5.  Wait for user acknowledgment before starting the next phase.
