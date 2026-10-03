import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function DotGridCanvas({ className = "" }) {
    const canvasRef = useRef(null);

        useEffect(() => {
            const canvas = canvasRef.current;
            const parent = canvas.parentElement;
            let animationId;

            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(parent.clientWidth, parent.clientHeight, false);

            const scene = new THREE.Scene();
            const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

            const blue = new THREE.Vector3(0.012, 0.412, 0.631); // #0369A1
            const sky = new THREE.Vector3(0.22, 0.74, 0.97);     // #38BDF8
            const emerald = new THREE.Vector3(0.016, 0.471, 0.341); // #047857

        const uniforms = {
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2(parent.clientWidth * 2, parent.clientHeight * 2) },
            u_opacities: { value: [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0] },
            u_colors: { value: [blue, blue, blue, sky, sky, emerald] },
            u_total_size: { value: 20.0 },
            u_dot_size: { value: 6.0 },
            u_reverse: { value: 0 },
        };

        const material = new THREE.ShaderMaterial({
            vertexShader: `
                precision mediump float;
                uniform vec2 u_resolution;
                out vec2 fragCoord;
                void main() {
                gl_Position = vec4(position, 1.0);
                fragCoord = (position.xy + 1.0) * 0.5 * u_resolution;
                fragCoord.y = u_resolution.y - fragCoord.y;
                }
            `,
            fragmentShader: `
                precision mediump float;
                in vec2 fragCoord;

                uniform float u_time;
                uniform float u_opacities[10];
                uniform vec3 u_colors[6];
                uniform float u_total_size;
                uniform float u_dot_size;
                uniform vec2 u_resolution;
                uniform int u_reverse;

                out vec4 fragColor;

                float PHI = 1.61803398874989484820459;
                float random(vec2 xy) {
                return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
                }

                void main() {
                vec2 st = fragCoord.xy;
                st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
                st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

                float opacity = step(0.0, st.x) * step(0.0, st.y);

                vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

                float frequency = 5.0;
                float show_offset = random(st2);
                float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
                opacity *= u_opacities[int(rand * 10.0)];
                opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
                opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

                vec3 color = u_colors[int(show_offset * 6.0)];

                float animation_speed_factor = 3.0;
                vec2 center_grid = u_resolution / 2.0 / u_total_size;
                float dist_from_center = distance(center_grid, st2);

                float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

                float current_timing_offset = timing_offset_intro;
                opacity *= step(current_timing_offset, u_time * animation_speed_factor);
                opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);

                fragColor = vec4(color, opacity);
                fragColor.rgb *= fragColor.a;
                }
            `,
            uniforms,
            glslVersion: THREE.GLSL3,
            blending: THREE.CustomBlending,
            blendSrc: THREE.OneFactor,
            blendDst: THREE.OneMinusSrcAlphaFactor,
            transparent: true,
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        scene.add(new THREE.Mesh(geometry, material));

        const startTime = performance.now();
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            uniforms.u_time.value = (performance.now() - startTime) / 1000.0;
            renderer.render(scene, camera);
        };
        animate();

        // follows the container size (the Sign Up form is taller than the screen)
        const observer = new ResizeObserver(() => {
            const w = parent.clientWidth;
            const h = parent.clientHeight;
            renderer.setSize(w, h, false);
            uniforms.u_resolution.value.set(w * 2, h * 2);
        });
        observer.observe(parent);

        return () => {
            cancelAnimationFrame(animationId);
            observer.disconnect();
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} className={className} />;
}