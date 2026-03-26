"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Skill from "../components/Skill.jsx";
import Heart from "../components/Heart.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import { getDeviceId } from "../lib/deviceId";

const defaultProfile = {
  username: "",
  level: 1,
  coins: 0,
  hp_total: 1000,
  hp_current: 800,
  main_objective: "",
  secondary_objective: "",
  strengths: "",
  weaknesses: "",
  goals_completion: 0,
  xp_current: 0,
  xp_target: 100,
};

const defaultSkillForm = {
  title: "",
  current_xp: 0,
  target_xp: 100,
  level: 1,
};

export default function LeftCol() {
  const homeMode = true;
  const [deviceId, setDeviceId] = useState("anonymous-device");
  const [profile, setProfile] = useState(defaultProfile);
  const [skills, setSkills] = useState([]);
  const [skillForm, setSkillForm] = useState(defaultSkillForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [skillToDelete, setSkillToDelete] = useState(null);

  const showMessage = (text, type = "success") => {
    setMessageType(type);
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  };

  const profileSummary = useMemo(
    () => ({
      username: profile.username || "Sem nome",
      levelLabel: `Nível ${profile.level}`,
      coinsLabel: `${profile.coins} Moedas`,
    }),
    [profile],
  );

  async function fetchProfileAndSkills(id) {
    setLoading(true);
    try {
      const [profileResponse, skillsResponse] = await Promise.all([
        fetch("/api/profile", {
          headers: { "x-device-id": id },
          cache: "no-store",
        }),
        fetch("/api/skills", {
          headers: { "x-device-id": id },
          cache: "no-store",
        }),
      ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData?.data || defaultProfile);
      }

      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        setSkills(skillsData?.data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    fetchProfileAndSkills(id);
  }, []);

  const updateProfileField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async () => {
    if (!profile.username?.trim()) {
      showMessage("Nome do perfil é obrigatório.", "error");
      return;
    }

    await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify(profile),
    });

    await fetchProfileAndSkills(deviceId);
    showMessage("Perfil salvo.");
  };

  const createSkill = async () => {
    if (!skillForm.title?.trim()) {
      showMessage("Informe o título da skill.", "error");
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
    await fetchProfileAndSkills(deviceId);
    showMessage("Skill criada.");
  };

  const createQuickSkill = async () => {
    await fetch("/api/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({
        title: "Nova Skill",
        current_xp: 0,
        target_xp: 100,
        level: 1,
      }),
    });

    await fetchProfileAndSkills(deviceId);
    showMessage("Skill criada.");
  };

  const deleteSkill = async (id) => {
    await fetch(`/api/skills/${id}`, {
      method: "DELETE",
      headers: { "x-device-id": deviceId },
    });

    await fetchProfileAndSkills(deviceId);
    showMessage("Skill removida.");
    setSkillToDelete(null);
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

    await fetchProfileAndSkills(deviceId);
    showMessage("Skill atualizada.");
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

    await fetchProfileAndSkills(deviceId);
    showMessage(`+${xpAmount} XP na skill e no perfil.`);
  };

  return (
    <section className="flex flex-col w-full gap-5 xl:w-[26%]">
      <div className="flex flex-col p-4 bg-white border border-graySm rounded shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
        {message ? (
          <p
            className={`p-2 text-sm rounded-md mb-3 ${
              messageType === "error"
                ? "text-red-700 bg-red-100"
                : "text-green-700 bg-green-100"
            }`}
          >
            {message}
          </p>
        ) : null}

        <img
          src="/assets/images/Profile-Icon.png"
          alt=""
          className="object-cover w-full rounded h-[140px] mb-4 bg-graySm/30"
        />

        <div className="flex flex-wrap items-center gap-1.5 text-sm md:text-[15px] font-medium text-grayMd mb-4">
          <span className="font-bold text-black">
            {profileSummary.username}
          </span>
          <span className="text-grayMd/60">&bull;</span>
          <span>{profileSummary.levelLabel}</span>
          <span className="text-grayMd/60">&bull;</span>
          <span>{profileSummary.coinsLabel}</span>
        </div>

        <div className="mb-5">
          <Heart vidaTotal={profile.hp_total} vidaAtual={profile.hp_current} />
        </div>

        <div className="grid grid-cols-[130px_auto_1fr] gap-x-2 gap-y-3 text-[13px] md:text-sm mb-6 items-center">
          <span className="font-bold text-grayMd">Objetivo Principal</span>
          <span className="font-bold text-grayMd">:</span>
          <span className="truncate text-black">
            {profile.main_objective || "-"}
          </span>

          <span className="font-bold text-grayMd">Objetivo Secundário</span>
          <span className="font-bold text-grayMd">:</span>
          <span className="truncate text-black">
            {profile.secondary_objective || "-"}
          </span>

          <span className="font-bold text-grayMd">Forças</span>
          <span className="font-bold text-grayMd">:</span>
          <span className="truncate text-black">
            {profile.strengths || "-"}
          </span>

          <span className="font-bold text-grayMd">Fraquezas</span>
          <span className="font-bold text-grayMd">:</span>
          <span className="truncate text-black">
            {profile.weaknesses || "-"}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mb-5">
          <div className="flex justify-between text-[13px] md:text-sm">
            <span className="font-bold text-grayMd">Conclusão de metas :</span>
            <span className="font-bold text-black">
              {profile.goals_completion}%
            </span>
          </div>
          <div className="relative w-full h-1.5 rounded-full bg-graySm/60 overflow-hidden">
            <div
              className="absolute h-full rounded-full bg-primary"
              style={{ width: `${profile.goals_completion}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mb-2">
          <div className="flex justify-between text-[13px] md:text-sm">
            <span className="font-bold text-grayMd">Experiência :</span>
            <span className="font-bold text-black">
              {profile.xp_current} / {profile.xp_target} xp
            </span>
          </div>
          <div className="relative w-full h-1.5 rounded-full bg-graySm/60 overflow-hidden">
            <div
              className="absolute h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((profile.xp_current / profile.xp_target) * 100),
                )}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0 w-full">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[20px] font-bold text-grayMd flex items-center gap-2">
            ⚔️ Skills
          </h2>
        </div>
        <div className="w-full border-b-2 border-graySm mb-3"></div>

        {loading ? (
          <p className="text-sm text-grayMd mb-2">Carregando...</p>
        ) : null}

        <div className="flex flex-col gap-2.5 mb-3">
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
              compact={homeMode}
              onDelete={() => setSkillToDelete(skill)}
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

          {!loading && skills.length === 0 ? (
            <p className="text-sm text-grayMd py-2 text-center border border-dashed rounded border-graySm">
              Nenhuma skill criada
            </p>
          ) : null}
        </div>

        <button
          onClick={homeMode ? createQuickSkill : createSkill}
          className="w-full py-1.5 text-xs font-semibold uppercase text-grayMd border border-graySm rounded drop-shadow-sm bg-white hover:bg-gray-50 transition-colors"
        >
          Nova Skill +
        </button>

        {!homeMode ? (
          <ConfirmModal
            open={Boolean(skillToDelete)}
            title="Excluir skill"
            description={`Deseja excluir a skill "${skillToDelete?.title || ""}"?`}
            confirmLabel="Excluir"
            onCancel={() => setSkillToDelete(null)}
            onConfirm={() => deleteSkill(skillToDelete.id)}
          />
        ) : null}
      </div>
    </section>
  );
}
