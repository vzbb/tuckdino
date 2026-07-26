"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

export type DinoSpecies =
  | "parasaurolophus"
  | "apatosaurus"
  | "stegosaurus"
  | "trex"
  | "velociraptor"
  | "triceratops";

export type DinoClip = "idle" | "walk" | "run" | "jump" | "attack";

export const SPECIES_BY_EGG = {
  0: "parasaurolophus",
  1: "apatosaurus",
  2: "stegosaurus",
  3: "trex",
  4: "velociraptor",
} as const satisfies Record<0 | 1 | 2 | 3 | 4, DinoSpecies>;

export const SPECIES_LABELS: Record<DinoSpecies, string> = {
  parasaurolophus: "Parasaurolophus",
  apatosaurus: "Apatosaurus",
  stegosaurus: "Stegosaurus",
  trex: "T. Rex",
  velociraptor: "Velociraptor",
  triceratops: "Triceratops",
};

const MODEL_URLS: Record<DinoSpecies, string> = {
  parasaurolophus: "/assets/quaternius/Parasaurolophus.glb",
  apatosaurus: "/assets/quaternius/Apatosaurus.glb",
  stegosaurus: "/assets/quaternius/Stegosaurus.glb",
  trex: "/assets/quaternius/Trex.glb",
  velociraptor: "/assets/quaternius/Velociraptor.glb",
  triceratops: "/assets/quaternius/Triceratops.glb",
};

const NORMALIZED_HEIGHT = 1.5;
const FADE_SECONDS = 0.14;
const BOUNDS_CORRECTION: Record<DinoSpecies, number> = {
  parasaurolophus: 1,
  apatosaurus: 1,
  stegosaurus: 1,
  trex: 1,
  velociraptor: 1,
  // This source rig has an unusually tall animated bounding box, which would
  // otherwise make Mossback read at about half the intended size.
  triceratops: 1.55,
};

type EggId = keyof typeof SPECIES_BY_EGG;

export function getSpeciesForEgg(id: number | null | undefined): DinoSpecies {
  return id == null
    ? SPECIES_BY_EGG[0]
    : SPECIES_BY_EGG[id as EggId] ?? SPECIES_BY_EGG[0];
}

export type AnimatedDinosaurProps = {
  species: DinoSpecies;
  animation?: DinoClip;
  /** Change this token to replay a one-shot animation without changing its name. */
  animationKey?: string | number;
  /** Multiplier applied after every species is normalized to the same height. */
  scale?: number;
  glowColor?: string;
  glowIntensity?: number;
  tintColor?: string;
  tintStrength?: number;
};

type PreparedModel = {
  scene: THREE.Group;
  materials: THREE.Material[];
  normalizedScale: number;
  groundOffset: number;
};

function prepareModel(source: THREE.Group, species: DinoSpecies): PreparedModel {
  const scene = SkeletonUtils.clone(source) as THREE.Group;
  const materialClones = new Map<THREE.Material, THREE.Material>();

  const cloneMaterial = (material: THREE.Material) => {
    const existing = materialClones.get(material);
    if (existing) return existing;

    const clone = material.clone();
    materialClones.set(material, clone);
    return clone;
  };

  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;

    object.castShadow = true;
    object.receiveShadow = true;
    object.material = Array.isArray(object.material)
      ? object.material.map(cloneMaterial)
      : cloneMaterial(object.material);
  });

  scene.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(scene);
  const size = bounds.getSize(new THREE.Vector3());
  const normalizedScale = (size.y > 0 ? NORMALIZED_HEIGHT / size.y : 1) * BOUNDS_CORRECTION[species];

  return {
    scene,
    materials: Array.from(materialClones.values()),
    normalizedScale,
    groundOffset: Number.isFinite(bounds.min.y) ? -bounds.min.y * normalizedScale : 0,
  };
}

function findClipName(names: string[], requested: DinoClip): string | null {
  return names.find((name) => name.toLowerCase().includes(requested)) ?? null;
}

function setGlow(
  material: THREE.Material,
  glowColor: string | undefined,
  glowIntensity: number | undefined
) {
  if (!(material instanceof THREE.MeshStandardMaterial)) return;

  const intensity = glowIntensity ?? (glowColor ? 0.3 : 0);
  material.emissive.copy(glowColor ? new THREE.Color(glowColor) : material.color);
  material.emissiveIntensity = intensity;
  material.needsUpdate = true;
}

export function AnimatedDinosaur({
  species,
  animation = "idle",
  animationKey,
  scale = 1,
  glowColor,
  glowIntensity,
  tintColor,
  tintStrength = 0,
}: AnimatedDinosaurProps) {
  const url = MODEL_URLS[species];
  const gltf = useGLTF(url);
  const animationRoot = useRef<THREE.Group>(null);
  const model = useMemo(() => prepareModel(gltf.scene, species), [gltf.scene, species]);
  const { actions, names } = useAnimations(gltf.animations, animationRoot);

  useEffect(() => {
    model.materials.forEach((material) => {
      setGlow(material, glowColor, glowIntensity);
      if (tintColor && tintStrength > 0 && material instanceof THREE.MeshStandardMaterial) {
        material.color.lerp(new THREE.Color(tintColor), Math.min(.72, tintStrength));
        material.needsUpdate = true;
      }
    });
  }, [glowColor, glowIntensity, model.materials, tintColor, tintStrength]);

  useEffect(() => {
    const clipName = findClipName(names, animation);
    if (!clipName) return;

    const action = actions[clipName];
    if (!action) return;

    Object.values(actions).forEach((candidate) => {
      if (candidate && candidate !== action) candidate.fadeOut(FADE_SECONDS);
    });

    const oneShot = animation === "attack";
    action.reset();
    action.enabled = true;
    action.clampWhenFinished = oneShot;
    action.setLoop(oneShot ? THREE.LoopOnce : THREE.LoopRepeat, oneShot ? 1 : Infinity);
    action.fadeIn(FADE_SECONDS).play();

    return () => {
      action.fadeOut(FADE_SECONDS);
    };
  }, [actions, animation, animationKey, names]);

  useEffect(
    () => () => {
      model.materials.forEach((material) => material.dispose());
    },
    [model.materials]
  );

  return (
    <group ref={animationRoot} scale={scale}>
      <primitive
        object={model.scene}
        scale={model.normalizedScale}
        position-y={model.groundOffset}
        dispose={null}
      />
    </group>
  );
}
