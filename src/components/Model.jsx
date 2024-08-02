import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Image, useFBO, useTexture } from "@react-three/drei";
import * as THREE from "three";
import useMouse from "@/hooks/useMouse";
import useDimension from "@/hooks/useDimension";
import { vertex } from "@/shaders/vertex";
import { fragment } from "@/shaders/fragment";

export default function Model() {
  const { viewport } = useThree();
  const imageTexture = useTexture("/images/picture1.jpeg");
  const texture = useTexture("/images/brush.png");
  const meshRefs = useRef([]);
  const [meshes, setMeshes] = useState([]);
  const mouse = useMouse();
  const device = useDimension();
  const [prevMouse, setPrevMouse] = useState({ x: 0, y: 0 });
  const [currentWave, setCurrentWave] = useState(0);
  const { gl, scene, camera } = useThree();
  const max = 100;

  const uniforms = useRef({
    uDisplacement: { value: null },
    uTexture: { value: null },
    winResolution: {
      value: new THREE.Vector2(0, 0),
    },
  });

  const fboBase = useFBO(device.width, device.height);
  const fboTexture = useFBO(device.width, device.height);

  useEffect(() => {
    const generatedMeshes = Array.from({ length: max }).map((_, i) => (
      <mesh
        key={i}
        position={[0, 0, 0]}
        ref={(el) => (meshRefs.current[i] = el)}
        rotation={[0, 0, Math.random()]}
        visible={false}
      >
        <planeGeometry args={[60, 60, 1, 1]} />
        <meshBasicMaterial transparent={true} map={texture} />
      </mesh>
    ));
    setMeshes(generatedMeshes);
  }, [texture]);

  function setNewWave(x, y, currentWave) {
    const mesh = meshRefs.current[currentWave];
    if (mesh) {
      mesh.position.x = x;
      mesh.position.y = y;
      mesh.visible = true;
      mesh.material.opacity = 1;
      mesh.scale.x = 1.75;
      mesh.scale.y = 1.75;
    }
  }

  function trackMousePos(x, y) {
    if (Math.abs(x - prevMouse.x) > 0.1 || Math.abs(y - prevMouse.y) > 0.1) {
      setCurrentWave((currentWave + 1) % max);
      setNewWave(x, y, currentWave);
    }
    setPrevMouse({ x: x, y: y });
  }

  useFrame(() => {
    const x = mouse.x - device.width / 2;
    const y = -mouse.y + device.height / 2;
    trackMousePos(x, y);
    meshRefs.current.forEach((mesh) => {
      if (mesh.visible) {
        mesh.rotation.z += 0.025;
        mesh.material.opacity *= 0.95;
        mesh.scale.x = 0.98 * mesh.scale.x + 0.155;
        mesh.scale.y = 0.98 * mesh.scale.y + 0.155;
      }
    });

    if (device.width > 0 && device.height > 0) {
      // uniforms.current.uTexture.value = imageTexture;

      // Render to base texture with meshes
      gl.setRenderTarget(fboBase);
      gl.clear();
      meshRefs.current.forEach((mesh) => {
        if (mesh.visible) {
          scene.add(mesh);
        }
      });
      gl.render(scene, camera);
      meshRefs.current.forEach((mesh) => {
        if (mesh.visible) {
          scene.remove(mesh);
        }
      });
      uniforms.current.uDisplacement.value = fboBase.texture;
      uniforms.current.uTexture.value = fboBase.texture;
      gl.setRenderTarget(null);

      // Render the scene with updated displacement
      // gl.setRenderTarget(fboTexture);
      // gl.clear();
      // gl.render(scene, camera);
      // uniforms.current.uTexture.value = fboTexture.texture;
      // gl.setRenderTarget(null);

      uniforms.current.winResolution.value = new THREE.Vector2(device.width, device.height).multiplyScalar(
        device.pixelRatio
      );
    }
  });

  function Images() {
    const { viewport } = useThree();

    return (
      <group>
        <Image
          position={[-0.25 * viewport.width, 0, 1]}
          scale={[viewport.width / 5, viewport.width / 4, 1]}
          url="/images/picture1.jpeg"
          alt="Picture 1"
        />
        <Image
          position={[0 * viewport.width, 0, 1]}
          scale={[viewport.width / 5, viewport.width / 4, 1]}
          url="/images/picture2.jpeg"
          alt="Picture 2"
        />
        <Image
          position={[0.25 * viewport.width, 0, 1]}
          scale={[viewport.width / 5, viewport.width / 4, 1]}
          url="/images/picture3.jpeg"
          alt="Picture 3"
        />
      </group>
    );
  }

  return (
    <group>
      {meshes}
      <mesh>
        <Images />
        <planeGeometry args={[device.width, device.height, 1, 1]} />
        <shaderMaterial
          args={[device.width / 2, device.height / 2]}
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent={true}
          uniforms={uniforms.current}
        ></shaderMaterial>
      </mesh>
    </group>
  );
}
