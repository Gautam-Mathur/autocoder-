import type { ProjectPlan, PlannedEntity } from './plan-generator.js';

export interface LearningContext {
  patterns: LearnedPattern[];
  preferences: LearnedPreference[];
  outcomes: OutcomeSummary[];
}

export interface LearnedPattern {
  id?: number;
  patternType: 'entity-structure' | 'field-naming' | 'workflow-design' | 'ui-layout' | 'tech-choice' | 'domain-mapping' | 'validation-rule' | 'page-structure';
  domainId?: string;
  entityType?: string;
  patternKey: string;
  patternValue: Record<string, any>;
  successCount: number;
  failureCount: number;
  reliability: number;
}

export interface LearnedPreference {
  key: string;
  value: string;
  category: 'styling' | 'naming' | 'architecture' | 'features' | 'workflow' | 'ui' | 'tech';
  frequency: number;
}

export interface OutcomeSummary {
  domainId?: string;
  avgEntityCount: number;
  avgFileCount: number;
  modificationRate: number;
  avgErrorCount: number;
  avgAutoFixCount: number;
  totalGenerations: number;
}

export interface GenerationFeedback {
  conversationId: number;
  projectDescription: string;
  domainId?: string;
  plan: ProjectPlan;
  generatedFiles: { path: string; content: string }[];
  errors: string[];
  autoFixes: string[];
  userModifications: { file: string; type: string; description: string }[];
  generationTimeMs: number;
}

export class GenerationLearningEngine {
  private patterns: Map<string, LearnedPattern> = new Map();
  private preferences: Map<string, LearnedPreference> = new Map();
  private recentOutcomes: OutcomeSummary[] = [];
  private dbAvailable: boolean = false;

  constructor() {
    this.initializeDefaultPatterns();
  }

  private initializeDefaultPatterns(): void {
    const defaults: LearnedPattern[] = [
      {
        patternType: 'entity-structure',
        patternKey: 'person-entity-fields',
        patternValue: {
          recommended: ['firstName', 'lastName', 'email', 'phone', 'status'],
          optional: ['avatar', 'address', 'city', 'state', 'zipCode', 'notes'],
        },
        successCount: 10,
        failureCount: 0,
        reliability: 1,
      },
      {
        patternType: 'entity-structure',
        patternKey: 'transaction-entity-fields',
        patternValue: {
          recommended: ['amount', 'date', 'status', 'reference', 'type'],
          optional: ['notes', 'dueDate', 'paidDate', 'category'],
        },
        successCount: 8,
        failureCount: 0,
        reliability: 1,
      },
      {
        patternType: 'workflow-design',
        patternKey: 'order-workflow',
        patternValue: {
          states: ['draft', 'pending', 'approved', 'in-progress', 'completed', 'cancelled'],
          commonTransitions: [
            { from: 'draft', to: 'pending', action: 'Submit' },
            { from: 'pending', to: 'approved', action: 'Approve' },
            { from: 'approved', to: 'in-progress', action: 'Start' },
            { from: 'in-progress', to: 'completed', action: 'Complete' },
          ],
        },
        successCount: 12,
        failureCount: 1,
        reliability: 0.92,
      },
      {
        patternType: 'ui-layout',
        patternKey: 'dashboard-kpi-count',
        patternValue: { optimalCount: 4, maxCount: 6 },
        successCount: 15,
        failureCount: 2,
        reliability: 0.88,
      },
      {
        patternType: 'ui-layout',
        patternKey: 'list-page-fields',
        patternValue: { optimalColumns: 5, maxColumns: 7 },
        successCount: 10,
        failureCount: 1,
        reliability: 0.91,
      },
      {
        patternType: 'tech-choice',
        patternKey: 'form-validation',
        patternValue: { preferred: 'zod', alternative: 'inline' },
        successCount: 20,
        failureCount: 0,
        reliability: 1,
      },
      {
        patternType: 'validation-rule',
        patternKey: 'email-validation',
        patternValue: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', errorMessage: 'Invalid email format' },
        successCount: 25,
        failureCount: 0,
        reliability: 1,
      },
      {
        patternType: 'page-structure',
        patternKey: 'list-page-features',
        patternValue: {
          recommended: ['search', 'create-dialog', 'delete-action', 'status-filter'],
          optional: ['export', 'bulk-actions', 'pagination', 'sort'],
        },
        successCount: 18,
        failureCount: 2,
        reliability: 0.9,
      },
      {
        patternType: 'field-naming',
        patternKey: 'date-field-naming',
        patternValue: {
          patterns: {
            creation: 'createdAt',
            update: 'updatedAt',
            due: 'dueDate',
            start: 'startDate',
            end: 'endDate',
            schedule: 'scheduledDate',
            birth: 'dateOfBirth',
          },
        },
        successCount: 30,
        failureCount: 1,
        reliability: 0.97,
      },
      {
        patternType: 'domain-mapping',
        patternKey: 'veterinary',
        patternValue: {
          entities: ['Pet', 'Owner', 'Appointment', 'Treatment', 'Prescription'],
          blendSources: ['healthcare', 'crm'],
          kpis: ['Total Patients', 'Appointments Today', 'Revenue', 'Pending Treatments'],
        },
        successCount: 3,
        failureCount: 0,
        reliability: 1,
      },
    ];

    for (const pattern of defaults) {
      this.patterns.set(pattern.patternKey, pattern);
    }
  }

  async setDatabaseAvailable(available: boolean): Promise<void> {
    this.dbAvailable = available;
  }

  async recordOutcome(feedback: GenerationFeedback): Promise<void> {
    for (const entity of feedback.plan.dataModel) {
      this.learnEntityPattern(entity, feedback.domainId);
    }

    if (feedback.plan.workflows) {
      for (const workflow of feedback.plan.workflows) {
        const key = `workflow-${workflow.entity.toLowerCase()}`;
        const existing = this.patterns.get(key);
        if (existing) {
          existing.successCount += feedback.errors.length === 0 ? 1 : 0;
          existing.failureCount += feedback.errors.length > 0 ? 1 : 0;
          existing.reliability = existing.successCount / (existing.successCount + existing.failureCount);
        } else {
          this.patterns.set(key, {
            patternType: 'workflow-design',
            patternKey: key,
            patternValue: {
              states: workflow.states,
              commonTransitions: workflow.transitions,
            },
            successCount: feedback.errors.length === 0 ? 1 : 0,
            failureCount: feedback.errors.length > 0 ? 1 : 0,
            reliability: feedback.errors.length === 0 ? 1 : 0,
          });
        }
      }
    }

    if (feedback.userModifications.length > 0) {
      for (const mod of feedback.userModifications) {
        this.learnFromModification(mod, feedback.domainId);
      }
    }

    if (feedback.domainId) {
      this.learnDomainMapping(feedback.domainId, feedback.plan);
    }
  }

  private learnEntityPattern(entity: PlannedEntity, domainId?: string): void {
    const key = `entity-${entity.name.toLowerCase()}`;
    const fieldNames = entity.fields.map(f => f.name);

    const existing = this.patterns.get(key);
    if (existing) {
      const existingFields = existing.patternValue.recommended || [];
      const mergedFields = Array.from(new Set([...existingFields, ...fieldNames]));
      existing.patternValue.recommended = mergedFields;
      existing.successCount += 1;
      existing.reliability = existing.successCount / (existing.successCount + existing.failureCount);
      if (domainId) {
        existing.domainId = domainId;
      }
    } else {
      this.patterns.set(key, {
        patternType: 'entity-structure',
        entityType: entity.name,
        domainId,
        patternKey: key,
        patternValue: {
          recommended: fieldNames,
          fieldTypes: Object.fromEntries(entity.fields.map(f => [f.name, f.type])),
        },
        successCount: 1,
        failureCount: 0,
        reliability: 1,
      });
    }
  }

  private learnFromModification(mod: { file: string; type: string; description: string }, domainId?: string): void {
    const key = `mod-${mod.type}-${mod.file.split('/').pop()?.replace(/\.\w+$/, '')}`;

    if (mod.type === 'field-added' || mod.type === 'field-removed' || mod.type === 'field-modified') {
      const preference: LearnedPreference = {
        key: `field-mod-${mod.description}`,
        value: mod.description,
        category: 'architecture',
        frequency: 1,
      };
      const existing = this.preferences.get(preference.key);
      if (existing) {
        existing.frequency += 1;
      } else {
        this.preferences.set(preference.key, preference);
      }
    }

    if (mod.type === 'style-change' || mod.type === 'ui-change') {
      this.preferences.set(`ui-mod-${mod.description}`, {
        key: `ui-mod-${mod.description}`,
        value: mod.description,
        category: 'ui',
        frequency: 1,
      });
    }
  }

  private learnDomainMapping(domainId: string, plan: ProjectPlan): void {
    const key = `domain-${domainId}`;
    const existing = this.patterns.get(key);

    if (existing) {
      existing.successCount += 1;
      existing.reliability = existing.successCount / (existing.successCount + existing.failureCount);
    } else {
      this.patterns.set(key, {
        patternType: 'domain-mapping',
        domainId,
        patternKey: key,
        patternValue: {
          entities: plan.dataModel.map(e => e.name),
          modules: plan.modules.map(m => m.name),
          kpis: plan.kpis,
          pageCount: plan.pages.length,
        },
        successCount: 1,
        failureCount: 0,
        reliability: 1,
      });
    }
  }

  getEntityRecommendations(entityName: string, domainId?: string): { recommendedFields: string[]; fieldTypes: Record<string, string> } | null {
    const key = `entity-${entityName.toLowerCase()}`;
    const pattern = this.patterns.get(key);

    if (pattern && pattern.reliability >= 0.5) {
      return {
        recommendedFields: pattern.patternValue.recommended || [],
        fieldTypes: pattern.patternValue.fieldTypes || {},
      };
    }

    for (const [, pat] of Array.from(this.patterns.entries())) {
      if (pat.patternType === 'entity-structure' &&
          pat.entityType?.toLowerCase() === entityName.toLowerCase() &&
          pat.reliability >= 0.5) {
        return {
          recommendedFields: pat.patternValue.recommended || [],
          fieldTypes: pat.patternValue.fieldTypes || {},
        };
      }
    }

    return null;
  }

  getWorkflowRecommendation(entityName: string): { states: string[]; transitions: any[] } | null {
    const key = `workflow-${entityName.toLowerCase()}`;
    const pattern = this.patterns.get(key);

    if (pattern && pattern.reliability >= 0.5) {
      return {
        states: pattern.patternValue.states || [],
        transitions: pattern.patternValue.commonTransitions || [],
      };
    }

    const orderPattern = this.patterns.get('order-workflow');
    if (orderPattern && entityName.toLowerCase().includes('order')) {
      return {
        states: orderPattern.patternValue.states || [],
        transitions: orderPattern.patternValue.commonTransitions || [],
      };
    }

    return null;
  }

  getUIRecommendations(): { dashboardKpiCount: number; listPageColumns: number; listPageFeatures: string[] } {
    const kpiPattern = this.patterns.get('dashboard-kpi-count');
    const listPattern = this.patterns.get('list-page-fields');
    const featurePattern = this.patterns.get('list-page-features');

    return {
      dashboardKpiCount: kpiPattern?.patternValue.optimalCount || 4,
      listPageColumns: listPattern?.patternValue.optimalColumns || 5,
      listPageFeatures: featurePattern?.patternValue.recommended || ['search', 'create-dialog', 'delete-action'],
    };
  }

  getDomainMapping(domainId: string): { entities: string[]; modules: string[]; kpis: string[] } | null {
    const key = `domain-${domainId}`;
    const pattern = this.patterns.get(key);

    if (pattern) {
      return {
        entities: pattern.patternValue.entities || [],
        modules: pattern.patternValue.modules || [],
        kpis: pattern.patternValue.kpis || [],
      };
    }

    return null;
  }

  getPreferences(category?: string): LearnedPreference[] {
    const prefs = Array.from(this.preferences.values());
    if (category) {
      return prefs.filter(p => p.category === category);
    }
    return prefs;
  }

  getReliablePatterns(minReliability: number = 0.7): LearnedPattern[] {
    return Array.from(this.patterns.values())
      .filter(p => p.reliability >= minReliability)
      .sort((a, b) => b.reliability - a.reliability);
  }

  getFieldNamingRecommendation(semanticType: string): string | null {
    const namingPattern = this.patterns.get('date-field-naming');
    if (namingPattern && namingPattern.patternValue.patterns[semanticType]) {
      return namingPattern.patternValue.patterns[semanticType];
    }
    return null;
  }

  applyLearnedPatterns(plan: ProjectPlan): ProjectPlan {
    const enhancedPlan = { ...plan };

    for (const entity of enhancedPlan.dataModel) {
      const recommendations = this.getEntityRecommendations(entity.name);

      if (recommendations) {
        for (const fieldName of recommendations.recommendedFields) {
          const exists = entity.fields.some(f => f.name === fieldName);
          if (!exists && recommendations.fieldTypes[fieldName]) {
            entity.fields.push({
              name: fieldName,
              type: recommendations.fieldTypes[fieldName],
              required: false,
            });
          }
        }
      }

      const workflowRec = this.getWorkflowRecommendation(entity.name);
      if (workflowRec) {
        const hasWorkflow = enhancedPlan.workflows.some(w => w.entity === entity.name);
        if (!hasWorkflow && entity.fields.some(f => f.name === 'status')) {
          enhancedPlan.workflows.push({
            name: `${entity.name} Lifecycle`,
            entity: entity.name,
            states: workflowRec.states,
            transitions: workflowRec.transitions,
          });
        }
      }
    }

    const uiRec = this.getUIRecommendations();
    if (enhancedPlan.kpis.length < uiRec.dashboardKpiCount) {
      while (enhancedPlan.kpis.length < uiRec.dashboardKpiCount) {
        const entityName = enhancedPlan.dataModel[enhancedPlan.kpis.length % enhancedPlan.dataModel.length]?.name;
        if (entityName && !enhancedPlan.kpis.includes(`Total ${entityName}s`)) {
          enhancedPlan.kpis.push(`Total ${entityName}s`);
        } else {
          break;
        }
      }
    }

    return enhancedPlan;
  }

  async getLearningStats(): Promise<{
    totalPatterns: number;
    reliablePatterns: number;
    totalPreferences: number;
    totalOutcomes: number;
    patternsByType: Record<string, number>;
  }> {
    const patternsByType: Record<string, number> = {};
    for (const pattern of Array.from(this.patterns.values())) {
      patternsByType[pattern.patternType] = (patternsByType[pattern.patternType] || 0) + 1;
    }

    return {
      totalPatterns: this.patterns.size,
      reliablePatterns: Array.from(this.patterns.values()).filter(p => p.reliability >= 0.7).length,
      totalPreferences: this.preferences.size,
      totalOutcomes: this.recentOutcomes.length,
      patternsByType,
    };
  }

  exportPatterns(): LearnedPattern[] {
    return Array.from(this.patterns.values());
  }

  importPatterns(patterns: LearnedPattern[]): void {
    for (const pattern of patterns) {
      const existing = this.patterns.get(pattern.patternKey);
      if (existing) {
        existing.successCount += pattern.successCount;
        existing.failureCount += pattern.failureCount;
        existing.reliability = existing.successCount / (existing.successCount + existing.failureCount);
        if (pattern.patternValue) {
          existing.patternValue = { ...existing.patternValue, ...pattern.patternValue };
        }
      } else {
        this.patterns.set(pattern.patternKey, pattern);
      }
    }
  }
}

export const learningEngine = new GenerationLearningEngine();
