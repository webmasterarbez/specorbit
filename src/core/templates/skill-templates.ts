/**
 * Agent Skill Templates
 *
 * Compatibility facade that re-exports split workflow template modules.
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

export { getExploreSkillTemplate, getOrbitExploreCommandTemplate } from './workflows/explore.js';
export { getNewChangeSkillTemplate, getOrbitNewCommandTemplate } from './workflows/new-change.js';
export { getContinueChangeSkillTemplate, getOrbitContinueCommandTemplate } from './workflows/continue-change.js';
export { getApplyInstructions, getApplyChangeSkillTemplate, getOrbitApplyCommandTemplate } from './workflows/apply-change.js';
export { getUpdateChangeSkillTemplate, getOrbitUpdateCommandTemplate } from './workflows/update-change.js';
export { getFfChangeSkillTemplate, getOrbitFfCommandTemplate } from './workflows/ff-change.js';
export { getSyncSpecsSkillTemplate, getOrbitSyncCommandTemplate } from './workflows/sync-specs.js';
export { getArchiveChangeSkillTemplate, getOrbitArchiveCommandTemplate } from './workflows/archive-change.js';
export { getBulkArchiveChangeSkillTemplate, getOrbitBulkArchiveCommandTemplate } from './workflows/bulk-archive-change.js';
export { getVerifyChangeSkillTemplate, getOrbitVerifyCommandTemplate } from './workflows/verify-change.js';
export { getOnboardSkillTemplate, getOrbitOnboardCommandTemplate } from './workflows/onboard.js';
export { getOrbitProposeSkillTemplate, getOrbitProposeCommandTemplate } from './workflows/propose.js';
export { getFeedbackSkillTemplate } from './workflows/feedback.js';
