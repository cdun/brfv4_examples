(function(){

    const t3d = brfv4Example.drawing3d.t3d;

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
        mesh.position.set(-100,0,0);
        mesh.rotation.set(0,Math.PI,0);
        mesh.scale.set(100,100,100);
        window.videoMesh = mesh;
        
        t3d.baseNodes.forEach((node) => {
            console.log('Adding video to ', node);
            
            node.add(mesh);
        })
        
        el.setAttribute('src', '/assets/lips-xs.mp4');
        el.play();
    }

    const create3DNodes = () => {
        // Initialize THREE through t3d.

        const SCALE = 843.75;
        const POSITION = new THREE.Vector3(0,-30, 30);

        let gltfLoader = new THREE.GLTFLoader()
        gltfLoader.load('/assets/Face.glb', (asset) => {
            t3d.baseNodes.forEach((node) => {
                const clone = asset.scene.clone();
                window.face = clone;

                clone.scale.setScalar(SCALE);
                clone.position.copy(POSITION);
                node.add(clone);
            });
        });
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

        window.t3d = t3d;
        
        t3d.addBaseNodes(1);
        createVideo();
    }

    brfv4Example.updateCurrentExample = function(brfManager, imageData, draw) {

		brfManager.update(imageData);

		if(t3d) t3d.hideAll(); // Hide 3d models. Only show them on top of tracked faces.

		draw.clear();

		var faces = brfManager.getFaces();

		for(var i = 0; i < faces.length; i++) {

			var face = faces[i];

			if(face.state === brfv4.BRFState.FACE_TRACKING) {

                // Draw the 68 facial feature points as reference.
                // Note that this is done in 2D space, hence the Orthographic camera in the original examples.
                draw.drawVertices(face.vertices, 2.0, false, 0x00a0ff, 0.4);

                // Draw the center of the face.
                const g = draw.draw;
                g.beginFill(createjs.Graphics.getRGB(1,1,1));
                g.drawCircle(face.translationX, face.translationY, 3);
                g.endFill();
                
                // Translate the scene

				if(t3d) t3d.update(i, face, true);
			}
		}

		if(t3d) { t3d.render(); }
    };

})();