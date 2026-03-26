"use client";

import { useEffect, useState } from "react";
import Skill from "../../../components/Skill";
import ModuleScreen from "../../../components/ModuleScreen";
import FormModal from "../../../components/FormModal";
import { getDeviceId } from "../../../lib/deviceId";

const defaultSkillForm = {
  title: "",
  current_xp: 0,
  target_xp: 100,
  level: 1,
};

export default function SkillsPage() {
  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [skills, setSkills] = useState([]);
  const [skillForm, setSkillForm] = useState(defaultSkillForm);
  const [message, setMessage] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 1800);
  };

  const fetchSkills = async (id) => {
    const response = await fetch("/api/skills", {
      headers: { "x-device-id": id },
      cache: "no-store",
    });

    if (!response.ok) return;
    const data = await response.json();
    setSkills(data?.data || []);
  };

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchSkills(id);
  }, []);

  const createSkill = async () => {
    if (!skillForm.title?.trim()) {
      showMessage("Informe o título da skill.");
      return;
    }

    await fetch("/api/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(skillForm),
    });

    setSkillForm(defaultSkillForm);
    await fetchSkills(deviceId);
    setCreateModalOpen(false);
    showMessage("Skill criada.");
  };

  const updateSkill = async (id, payload) => {
    await fetch(`/api/skills/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(payload),
    });

    await fetchSkills(deviceId);
    showMessage("Skill atualizada.");
  };

  const deleteSkill = async (id) => {
    await fetch(`/api/skills/${id}`, {
      method: "DELETE",
      headers: { "x-device-id": deviceId },
    });

    await fetchSkills(deviceId);
    showMessage("Skill removida.");
  };

  const gainSkillXp = async (id, xpAmount) => {
    await fetch(`/api/skills/${id}/xp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({ xpAmount }),
    });

    await fetchSkills(deviceId);
    showMessage(`+${xpAmount} XP aplicado.`);
  };

  return (
    <ModuleScreen
      title="⚔️ Skills"
      subtitle="Evolua seu personagem"
      description="Crie habilidades, acumule XP e suba de nível ao longo da jornada."
      icon="🛡️"
    >
      {message ? (
        <p className="max-w-5xl p-2 mx-auto text-sm border rounded-md border-graySm">
          {message}
        </p>
      ) : null}

      <section className="max-w-5xl mx-auto">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-2 text-sm text-white rounded-md bg-primary"
        >
          Nova Skill +
        </button>
      </section>

      <section className="max-w-5xl mx-auto space-y-2">
        {skills.map((skill) => (
          <Skill
            key={skill.id}
            title={skill.title}
            xp={`${skill.current_xp} / ${skill.target_xp}`}
            lvl={`Nível ${skill.level}`}
            progressPercent={Math.min(
              100,
              Math.round((skill.current_xp / skill.target_xp) * 100),
            )}
            onDelete={() => deleteSkill(skill.id)}
            onLevelUp={() =>
              updateSkill(skill.id, {
                ...skill,
                level: Number(skill.level) + 1,
              })
            }
            onGainXp={() => gainSkillXp(skill.id, 5)}
            onGainBigXp={() => gainSkillXp(skill.id, 20)}
          />
        ))}
      </section>

      <FormModal
        open={createModalOpen}
        title="Nova skill"
        onClose={() => setCreateModalOpen(false)}
      >
        <div className="grid gap-2">
          <input
            className="p-2 border rounded-md border-graySm"
            placeholder="Título da skill"
            value={skillForm.title}
            onChange={(e) =>
              setSkillForm((current) => ({ ...current, title: e.target.value }))
            }
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              className="p-2 border rounded-md border-graySm"
              type="number"
              min="0"
              placeholder="XP atual"
              value={skillForm.current_xp}
              onChange={(e) =>
                setSkillForm((current) => ({
                  ...current,
                  current_xp: Number(e.target.value) || 0,
                }))
              }
            />
            <input
              className="p-2 border rounded-md border-graySm"
              type="number"
              min="1"
              placeholder="XP alvo"
              value={skillForm.target_xp}
              onChange={(e) =>
                setSkillForm((current) => ({
                  ...current,
                  target_xp: Number(e.target.value) || 1,
                }))
              }
            />
            <input
              className="p-2 border rounded-md border-graySm"
              type="number"
              min="1"
              placeholder="Nível"
              value={skillForm.level}
              onChange={(e) =>
                setSkillForm((current) => ({
                  ...current,
                  level: Number(e.target.value) || 1,
                }))
              }
            />
          </div>
          <button
            onClick={createSkill}
            className="p-2 text-white rounded-md bg-primary"
          >
            Criar skill
          </button>
        </div>
      </FormModal>
    </ModuleScreen>
  );
}
