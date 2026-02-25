import * as THREE from "three";

export const getCoinPath = () => {
    return new THREE.CatmullRomCurve3(
        [
            new THREE.Vector3(0, 0, 15),
            new THREE.Vector3(4, 0, 10),
            new THREE.Vector3(-4, 0, 5),   // Serpentine approach
            new THREE.Vector3(0, 0, 0),    // Through the slot (Gap between x=-2 and x=2 roughly)
            new THREE.Vector3(4, 0, -5),
            new THREE.Vector3(8, 0, -10),
            new THREE.Vector3(12, 0, 0),   // Swing wide right
            new THREE.Vector3(8, 0, 10),   // ReturnLoop
        ],
        true, // Closed loop
        'catmullrom',
        0.5 // tension
    );
};
