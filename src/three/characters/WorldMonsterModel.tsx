"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

export type WorldMonsterKind = "pig" | "bat" | "tree" | "mushroom" | "dragon";
export type WorldMonsterMotion = "idle" | "walk" | "attack";

const URLS: Record<WorldMonsterKind, string> = {
  pig: "/assets/world/monsters/glTF/Pig.gltf",
  bat: "/assets/world/monsters/glTF/Bat.gltf",
  tree: "/assets/world/monsters/glTF/Tree.gltf",
  mushroom: "/assets/world/monsters/glTF/Mushroom.gltf",
  dragon: "/assets/world/monsters/glTF/YellowDragon.gltf",
};

const CLIPS: Record<WorldMonsterKind, Record<WorldMonsterMotion, string[]>> = {
  pig: { idle: ["Idle"], walk: ["Walk"], attack: ["Bite_InPlace", "Bite_Front"] },
  bat: { idle: ["Flying"], walk: ["Flying"], attack: ["Bite_Front"] },
  tree: { idle: ["Idle"], walk: ["Walk"], attack: ["Bite_InPlace", "Bite_Front"] },
  mushroom: { idle: ["Idle"], walk: ["Walk"], attack: ["Bite_InPlace", "Bite_Front"] },
  dragon: { idle: ["Flying"], walk: ["Flying"], attack: ["Bite_Front"] },
};

export function WorldMonsterModel({
  kind,
  motion,
  scale = 1,
  glow,
}: {
  kind: WorldMonsterKind;
  motion: WorldMonsterMotion;
  scale?: number;
  glow?: string;
}) {
  const source = useGLTF(URLS[kind]);
  const root = useRef<THREE.Group>(null);
  const prepared = useMemo(() => {
    const scene = SkeletonUtils.clone(source.scene) as THREE.Group;
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();
      if (glow && object.material instanceof THREE.MeshStandardMaterial) {
        object.material.emissive.set(glow);
        object.material.emissiveIntensity = .12;
      }
    });
    scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(scene);
    const size = bounds.getSize(new THREE.Vector3());
    const normalizedScale = size.y > 0 ? 1.55 / size.y : 1;
    return { scene, normalizedScale, ground: -bounds.min.y * normalizedScale };
  }, [glow, source.scene]);
  const { actions } = useAnimations(source.animations, root);

  useEffect(() => {
    const candidates = CLIPS[kind][motion];
    const name = candidates.find((candidate) => actions[candidate]);
    const action = name ? actions[name] : undefined;
    if (!action) return;
    Object.values(actions).forEach((other) => {
      if (other && other !== action) other.fadeOut(.12);
    });
    action.reset().fadeIn(.12).play();
    return () => {
      action.fadeOut(.12);
    };
  }, [actions, kind, motion]);

  return (
    <group ref={root} scale={scale}>
      <primitive
        object={prepared.scene}
        scale={prepared.normalizedScale}
        position-y={prepared.ground}
        dispose={null}
      />
    </group>
  );
}
