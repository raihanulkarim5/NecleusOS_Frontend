import { useState } from 'react';
import { SkillsListPage } from './SkillsListPage';
import { SkillDetailPage } from './SkillDetailPage';

export function SkillsModule() {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  if (selectedSkillId) {
    return <SkillDetailPage skillId={selectedSkillId} onBack={() => setSelectedSkillId(null)} />;
  }
  return <SkillsListPage onOpenSkill={setSelectedSkillId} />;
}
