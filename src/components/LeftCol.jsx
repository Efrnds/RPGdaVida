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
    <section className="flex flex-col w-full gap-4 xl:w-[26%]">
      <div className="flex flex-col gap-3 p-3 bg-white border rounded-md shadow-sm border-graySm">
        {message ? (
          <p
            className={`p-2 text-sm rounded-md ${
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
          className="object-cover w-full rounded-md h-28"
        />

        <div className="flex flex-wrap w-full gap-2 text-base">
          <p>{profileSummary.username}</p>
          <p>&bull;</p>
          <p>{profileSummary.levelLabel}</p>
          <p>&bull;</p>
          <p>{profileSummary.coinsLabel}</p>
        </div>

        <Heart vidaTotal={profile.hp_total} vidaAtual={profile.hp_current} />

        <div>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left text-grayMd">
                Objetivo Principal
              </p>
              <p className="text-sm font-bold text-grayMd">:</p>
            </div>
            <p className="text-sm">{profile.main_objective || "-"}</p>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left text-grayMd">
                Objetivo Secundário
              </p>
              <p className="text-sm font-bold text-grayMd">:</p>
            </div>
            <p className="text-sm">{profile.secondary_objective || "-"}</p>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left text-grayMd">Forças</p>
              <p className="text-sm font-bold text-grayMd">:</p>
            </div>
            <p className="text-sm">{profile.strengths || "-"}</p>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left text-grayMd">
                Fraquezas
              </p>
              <p className="text-sm font-bold text-grayMd">:</p>
            </div>
            <p className="text-sm">{profile.weaknesses || "-"}</p>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap justify-between">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left ">Conclusão de metas</p>
              <p className="text-sm font-bold ">:</p>
            </div>
            <div className="flex w-full gap-4">
              <div className="relative w-full h-2 my-auto rounded-full bg-graySm">
                <div
                  className="absolute h-2 rounded-full bg-primary"
                  style={{ width: `${profile.goals_completion}%` }}
                ></div>
              </div>
              <p className="my-auto text-sm font-semibold">
                {profile.goals_completion}%
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap justify-between">
            <div className="flex flex-wrap justify-between w-1/2">
              <p className="text-sm font-bold text-left ">Experiência</p>
              <p className="text-sm font-bold ">:</p>
            </div>
            <div className="flex w-full gap-4">
              <div className="relative flex-1 h-2 my-auto rounded-full bg-graySm">
                <div
                  className="absolute h-2 rounded-full bg-primary"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (profile.xp_current / profile.xp_target) * 100,
                      ),
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="my-auto text-sm">
                {profile.xp_current} / {profile.xp_target} xp
              </p>
            </div>
          </div>
        </div>

        {!homeMode ? (
          <>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <input
                className="p-1 border rounded-md border-graySm"
                placeholder="Nome"
                value={profile.username}
                onChange={(e) => updateProfileField("username", e.target.value)}
              />
              <input
                className="p-1 border rounded-md border-graySm"
                type="number"
                min="1"
                placeholder="Nível"
                value={profile.level}
                onChange={(e) =>
                  updateProfileField("level", Number(e.target.value) || 1)
                }
              />
              <input
                className="p-1 border rounded-md border-graySm"
                type="number"
                min="0"
                placeholder="Moedas"
                value={profile.coins}
                onChange={(e) =>
                  updateProfileField("coins", Number(e.target.value) || 0)
                }
              />
              <input
                className="p-1 border rounded-md border-graySm"
                type="number"
                min="0"
                placeholder="HP Atual"
                value={profile.hp_current}
                onChange={(e) =>
                  updateProfileField("hp_current", Number(e.target.value) || 0)
                }
              />
            </div>

            <button
              onClick={saveProfile}
              className="p-2 text-sm text-white rounded-md bg-primary hover:bg-primaryHover"
            >
              Salvar Perfil
            </button>
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 p-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-[32px] font-semibold leading-none text-grayMd">
              ⚔️ Skills
            </h2>
            <Link
              href="/home/skills"
              className="px-2 py-1 text-xs border rounded-md border-graySm text-grayMd hover:bg-white"
            >
              Ver todas
            </Link>
          </div>
          <hr className="mt-1 border-graySm" />
        </div>

        {loading ? <p className="text-sm text-grayMd">Carregando...</p> : null}

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
          <p className="text-sm text-grayMd">Nenhuma skill criada ainda.</p>
        ) : null}

        {!homeMode ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <input
              className="p-1 border rounded-md border-graySm"
              placeholder="Título da skill"
              value={skillForm.title}
              onChange={(e) =>
                setSkillForm((current) => ({
                  ...current,
                  title: e.target.value,
                }))
              }
            />
            <input
              className="p-1 border rounded-md border-graySm"
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
              className="p-1 border rounded-md border-graySm"
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
              className="p-1 border rounded-md border-graySm"
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
        ) : null}

        <button
          onClick={homeMode ? createQuickSkill : createSkill}
          className="py-1 text-sm border rounded-md text-grayMd border-graySm hover:bg-white"
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
