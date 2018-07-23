(function(){

    const geometry = new THREE.SphereGeometry( 5, 32, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const sphere = new THREE.Mesh( geometry, material );
    const t3d = brfv4Example.drawing3d.t3d;
    const facePosition = new THREE.Vector2(0,0);
    const distance = -10;

    window.sphere = sphere;

    const drawModel = () => {
        sphere.position.set(facePosition.x, facePosition.y, distance);
    }

    const createVideo = () => {
        // Create video element, append to DOM
        const el = document.createElement('video');
        el.style.display = 'none';
        el.setAttribute('autoplay', true);
        el.setAttribute('preload', true);
        el.setAttribute('loop', true);
        el.addEventListener('play', () => {
            console.info('Playing...');
        });

        // VideoTexture pointing to above
        const videoTexture = new THREE.VideoTexture(el);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        
        // Set up geometry (plane) with MeshBasicMaterial the texture
        const sixteenNine = 0.5625;
        const widthMeters = 1.2;
        const geometry = new THREE.PlaneGeometry(widthMeters, widthMeters * sixteenNine);
        const basicMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: videoTexture
        });
        const mesh = new THREE.Mesh(geometry, basicMat);
        mesh.position.set(0,-250,0);
        mesh.rotation.set(0,Math.PI,0);
        mesh.scale.set(200,200,200);
        window.videoMesh = mesh;
        
        t3d.baseNodes.forEach((node) => {
            console.log('Adding video to ', node);
            
            node.add(mesh);
        })
        
        el.setAttribute('src', '/assets/lips-xs.mp4');
    }

    const create3DNodes = () => {
        // Initialize THREE through t3d.

        // brfv4Example.dom.updateHeadline("Loading");
        // let loader = new THREE.GLTFLoader();
        // const SCALE = 1000;
        // loader.load('/assets/Lipstick.glb', (asset) => {
        //     brfv4Example.dom.updateHeadline("Loaded");
        //     // The drawing utils set up a baseNode for each face tracked.
        //     t3d.baseNodes.forEach((node) => {
        //         let clone = asset.scene.clone();
        //         window.lipstick = clone;

        //         // Asset contains entire GLTF file, we're after the scene.
        //         clone.renderOrder = 2;
        //         clone.position.set(0,0,0)
        //         clone.scale.set(SCALE,SCALE,SCALE);
        //         node.add(clone);
        //     });

        //     t3d.render();
        // });
    }

    brfv4Example.initCurrentExample = (brfManager, resolution) => {
        brfManager.init(resolution, resolution, brfv4Example.appId);
		brfManager.setNumFacesToTrack(1);

		// Relax starting conditions to eventually find more faces.

		var maxFaceSize = resolution.height;

		if(resolution.width < resolution.height) {
			maxFaceSize = resolution.width;
		}

		// Threshold values for the face to be detected. This reads in plain english as "the face will
		// occupy 20-100% of the largest pixel dimension"
		brfManager.setFaceDetectionParams(		maxFaceSize * 0.20, maxFaceSize * 1.00, 12, 8); 
		brfManager.setFaceTrackingStartParams(	maxFaceSize * 0.20, maxFaceSize * 1.00, 32, 35, 32); // ... tracked
        brfManager.setFaceTrackingResetParams(	maxFaceSize * 0.15, maxFaceSize * 1.00, 40, 55, 32); // ... lost.

        // t3d.loadOcclusionHead("assets/brfv4_occlusion_head.json", 1);
        // createVideo();

        console.log('Adding sphere to scene');
        
        t3d.scene.add(sphere);

    }

    brfv4Example.updateCurrentExample = function(brfManager, imageData, draw) {

        drawModel();

		brfManager.update(imageData);

		if(t3d) t3d.hideAll(); // Hide 3d models. Only show them on top of tracked faces.

		draw.clear();

		var faces = brfManager.getFaces();

		for(var i = 0; i < faces.length; i++) {

			var face = faces[i];

			if(face.state === brfv4.BRFState.FACE_TRACKING) {

				// Draw the 68 facial feature points as reference.
                draw.drawVertices(face.vertices, 2.0, false, 0x00a0ff, 0.4);

                // Draw the center of the face.
                const g = draw.draw;
                g.beginFill(createjs.Graphics.getRGB(1,1,1));
                g.drawCircle(face.translationX, face.translationY, 3);
                g.endFill();

                // facePosition.set(face.translationX, face.translationY)
                
                
                // Translate the scene

				if(t3d) t3d.update(i, face, true);
			}
		}

		if(t3d) { t3d.render(); }
    };

})();