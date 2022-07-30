class BrakeBanner {
	constructor(selector) {
		this.app = new PIXI.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0xffffff,
			resizeTo: window,
		});
		this.stage = this.app.stage;

		const el = document.querySelector(selector);

		el.appendChild(this.app.view)

		this.loadResource();

		this.particleLoop = this.particleLoop.bind(this)
	}
	loadResource() {
		this.loader = new PIXI.Loader();
		this.loader.add('brake_bike.png', 'images/brake_bike.png');
		this.loader.add("brake_handlerbar.png", "images/brake_handlerbar.png");
		this.loader.add("brake_lever.png", "images/brake_lever.png");

		this.loader.add("btn_circle.png", "images/btn_circle.png");
		this.loader.add("btn.png", "images/btn.png");

		this.loader.load();

		this.loader.onComplete.add(() => {
			this.show();
		})
	}

	show() {
		// 创建粒子动效
		this.createParticle();

		// 创建自行车主体
		this.createBicycle();

		// 创建按钮
		this.createActionButton();

		// 绑定事件
		this.bindEvent();

		// 开始骑行
		this.particleStart();

		// 固定自行车到页面右下角
		this.fixBibybleToRightBottom();
	}

	fixBibybleToRightBottom() {
		const resize = () => {
			this.bicycleContainer.x = window.innerWidth - this.bicycleContainer.width;
			this.bicycleContainer.y = window.innerHeight - this.bicycleContainer.height;

			this.btnContainer.x = this.bicycleContainer.x + this.bicycleContainer.width / 2;
			this.btnContainer.y = this.bicycleContainer.y + this.bicycleContainer.height / 2;
		}
		window.addEventListener('resize', resize);
		resize();
	}

	createParticle() {
		const particleContainer = new PIXI.Container();

		particleContainer.rotation = Math.PI / 180 * 35;

		particleContainer.pivot.x = window.innerWidth / 2;
		particleContainer.pivot.y = window.innerHeight / 2;
		particleContainer.x = window.innerWidth / 2;
		particleContainer.y = window.innerHeight / 2;

		const particles = [];
		const colors = [0xf1cf54, 0xb5cea8, 0xf1cf54, 0x818181, 0x000000];
		const len = parseInt(Math.random() * 20) + 20;
		for (let i = 0; i < len; i++) {
			const gr = new PIXI.Graphics();
			const idx = Math.floor(Math.random() * colors.length);
			gr.beginFill(colors[idx]);
			gr.drawCircle(0, 0, 6);
			gr.endFill();
			const pItem = {
				// 初始坐标
				sx: Math.random() * window.innerWidth,
				sy: Math.random() * window.innerHeight,
				// 粒子实例本身
				gr: gr
			}
			gr.x = pItem.sx;
			gr.y = pItem.sy;
			particleContainer.addChild(gr);
			particles.push(pItem);
		}

		this.stage.addChild(particleContainer);

		this.particles = particles;
	}

	particleStart() {
		this.speed = 0;
		gsap.ticker.add(this.particleLoop);
	}

	particlePause() {
		gsap.ticker.remove(this.particleLoop);
		for (const pItem of this.particles) {
			gsap.to(pItem.gr, { 
				duration: 0.3, 
				x: pItem.sx, 
				y: pItem.sy,
				ease: 'elastic.out' 
			});
			gsap.to(pItem.gr.scale, { 
				duration: 0.3, 
				x: 1, 
				y: 1,
			});
		}
	}

	particleLoop() {
		let speed = this.speed;
		speed += 0.2;
		speed = Math.min(speed, 20);
		for (const pItem of this.particles) {
			pItem.gr.y += speed;
			if (pItem.gr.y >= window.innerHeight) {
				pItem.gr.y = 0;
			}
			pItem.gr.scale.x = Math.max(-0.1 * speed + 1, 0.03);
			pItem.gr.scale.y = Math.min(5 * speed + 1, 30);
		}
		this.speed = speed;
	}

	createBicycle() {
		const bicycleContainer = new PIXI.Container();
		bicycleContainer.scale.x = bicycleContainer.scale.y = 0.3;

		// 车身，包含车轮
		const brakeBike = new PIXI.Sprite(this.loader.resources['brake_bike.png'].texture);
		// 车把手
		const brakeHandlerBar = new PIXI.Sprite(this.loader.resources['brake_handlerbar.png'].texture);
		// 刹车手柄
		const brakeLever = new PIXI.Sprite(this.loader.resources['brake_lever.png'].texture);

		bicycleContainer.addChild(brakeBike);
		bicycleContainer.addChild(brakeLever);
		bicycleContainer.addChild(brakeHandlerBar);

		brakeLever.x = 722;
		brakeLever.y = 900;

		this.brakeLever = brakeLever;
		this.bicycleContainer = bicycleContainer;

		this.stage.addChild(bicycleContainer);

	}

	createActionButton() {
		const btnContainer = new PIXI.Container();

		// 创建按钮和按钮外围的圈
		const btn = new PIXI.Sprite(this.loader.resources['btn.png'].texture);
		const btnCircle = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture);
		const btnCircle2 = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture);

		btnContainer.addChild(btn);
		btnContainer.addChild(btnCircle);
		btnContainer.addChild(btnCircle2);

		// 设置按钮和圆圈的中心点
		btn.pivot.x = btn.pivot.y = btn.width / 2;
		btnCircle.pivot.x = btnCircle.pivot.y = btnCircle.width / 2;
		btnCircle2.pivot.x = btnCircle2.pivot.y = btnCircle2.width / 2;

		// 其中一个圆圈要设置一个动效
		btnCircle.scale.x = btnCircle.scale.y = 0.8;
		gsap.to(btnCircle.scale, { duration: 1, x: 1.2, y: 1.2, repeat: -1 });
		gsap.to(btnCircle, { duration: 1, alpha: 0, repeat: -1 });

		// 设置按钮手指移动上去时鼠标变为可点击
		btnContainer.interactive = true;
		btnContainer.buttonMode = true;

		this.stage.addChild(btnContainer);

		this.btnContainer = btnContainer;
	}

	bindEvent() {
		this.brakeLever.pivot.x = 455;
		this.brakeLever.pivot.y = 455;
		// 给按钮加上事件，按下的时候捏紧刹车，松开则慢慢回正
		this.btnContainer.on("mousedown", () => {
			gsap.to(this.brakeLever, { duration: 0.5, rotation: Math.PI / 180 * -30 });
			this.particlePause();
		});
		this.btnContainer.on("mouseup", () => {
			gsap.to(this.brakeLever, { duration: 0.5, rotation: 0 });
			this.particleStart();
		});
	}
}