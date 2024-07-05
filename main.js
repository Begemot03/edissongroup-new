let models_images = {};
let pallete_places = [];
let models_btns = [];

window.onload = init;

function init() {
	models_images = getTrasformedModelsImg();
	pallete_places = document.querySelectorAll("[data-pallete-place]")

	hideModelsImgs(models_images);

	pallete_places.forEach(place => {
		const place_type = place.getAttribute("data-pallete-place");

		if(!place_type) return;

		const btnsNodes = createDynamicPalletes(models_images, place_type);
		
		btnsNodes.forEach(btn => place.appendChild(btn));
	})


	models_btns = document.querySelectorAll("[data-pallete-t]");

	// Добавляем хендлеры и создаем для всего этого хеш
	const modelsDataHash = { "curbtn" : {}, "curimg": {} };
	models_btns.forEach(btn => btn.addEventListener("click", palleteBtnHander(btn, models_images, modelsDataHash)));

	// РАБОТА СО MAIN СЛАЙДЕРОМ

	const nextBtnMainSlider = document.getElementById("main-slider_next");
	const prevBtnMainSlider = document.getElementById("main-slider_prev");
	const carouselMain = document.querySelector(".carousel");																																							
	const listItemMain = document.querySelector(".carousel .carousel-list");
	const thumbnailMain = document.querySelector(".carousel .thumbnail");

	if(nextBtnMainSlider && prevBtnMainSlider && carouselMain && listItemMain && thumbnailMain) {
		nextBtnMainSlider.onclick = () =>  showMainSlider("next");
		prevBtnMainSlider.onclick = () =>  showMainSlider("prev");
	}


	let timeRunningMain;
	let canNext = true;
	function showMainSlider(type) {
		if(!canNext) return;

		let itemSlider = document.querySelectorAll(".carousel-list_item");
		let itemThumbnail = document.querySelectorAll(".thumbnail_item");

		if(type === "next") {
			listItemMain.appendChild(itemSlider[0]);
			thumbnailMain.appendChild(itemThumbnail[0]);
			carouselMain.classList.add("next");
		} else if(type === "prev") {
			listItemMain.prepend(itemSlider[itemSlider.length - 1]);
			thumbnailMain.prepend(itemThumbnail[itemThumbnail.length - 1]);
			carouselMain.classList.add("prev");
		}

		clearTimeout(timeRunningMain);

		canNext = false;

		timeRunningMain = setTimeout(() => {
			carouselMain.classList.remove("next");
			carouselMain.classList.remove("prev");
			canNext = true;
			clearTimeout(timeRunningMain);
		}, 2300);
	}


	// Настройка скролла окна
	let prevYpos = 0;
	let prevSettingState = false;
	const header = document.querySelector("header");

	document.addEventListener("scroll", (e) => {
		if(window.scrollY < header.scrollHeight) {
			header.classList.add("sticky");
			header.classList.remove("fixed");
			prevSettingState = false;

			return;
		} else {
			header.classList.remove("sticky");
			header.classList.add("fixed");
		}

		let offsetY = window.scrollY - prevYpos;
		prevYpos = window.scrollY;

		if(!((offsetY > 0) ^ prevSettingState)) return;

		// Мотаем страницу вниз прячем топ
		if(offsetY > 0) {
			header.classList.add("hidden-header");
			prevSettingState = true;
		} else if (offsetY < 0) {
			header.classList.remove("hidden-header");
			prevSettingState = false;
		}
	});

	// Загружаем функциональности
	loadModalFunctionality();
	loadMobileMenu();
	loadShopFilter();
}

function palleteBtnHander(curBtn, imgs, hash) {
	return e => {
		const btn_color = curBtn.getAttribute("data-c");
		const btn_type = curBtn.getAttribute("data-pallete-t");

		if(!btn_color || !btn_type) return;

		// Если прошлая кнопка в хеше, то убираем у нее тип
		if(hash["curbtn"][`${btn_type}`]) hash["curbtn"][`${btn_type}`].classList.remove("selected_node");
		hash["curbtn"][`${btn_type}`] = curBtn;
		// Если прошлая кнопка undefined
		if(hash["curbtn"][`${btn_type}`]) hash["curbtn"][`${btn_type}`].classList.add("selected_node");

		if(hash["curimg"][`${btn_type}`]) hash["curimg"][`${btn_type}`].style.display = "none";
		hash["curimg"][`${btn_type}`] = imgs[`${btn_type}${btn_color}`];
		// Если прошлая картинка undefined
		if(hash["curimg"][`${btn_type}`]) hash["curimg"][`${btn_type}`].style.display = "block";
	}
}

function createDynamicPalletes(imgs, place_type) {
	return Object.keys(imgs)
	.filter(key => imgs[key].getAttribute("data-t") === place_type)
	.map(key => {
		const one_pallete = document.createElement("span");
		one_pallete.classList.add("inline-block", "w-8", "h-8", "rounded-lg", "shadow-md", "cursor-crosshair", "pallete_node", imgs[key].getAttribute("data-c"));
		one_pallete.setAttribute("data-pallete-t", place_type);
		one_pallete.setAttribute("data-c", imgs[key].getAttribute("data-c"));

		return one_pallete;
	});
}

function hideModelsImgs(imgs) {	
	Object.keys(imgs).forEach(key => imgs[key].style.display = "none");
}

function getTrasformedModelsImg() {
	return  [...document.querySelectorAll("[data-t]")].reduce((acc, current) => {
		return {
			...acc,
			[`${current.getAttribute("data-t")}${current.getAttribute("data-c")}`]: current,
		}
	}, {});
}

function loadModalFunctionality() {
	// Если нет модалок
	if(document.querySelectorAll("[data-modal-name]").length === 0) return;

	const modals = [...document.querySelectorAll("[data-modal-name]")].reduce((acc, current) => {
		// Закрытие модалки
		current.addEventListener("click", (e) => {
			e.preventDefault();

			unlockWindowScroll();
			current.classList.add("modal-hidden");
		});

		// У modal-content убираем пропагинацию, чтобы при клике на него модалка не закрывалась
		current.children[0].addEventListener("click", (e) => {
			e.stopPropagation()
		});

		return {
			...acc,
			[current.getAttribute("data-modal-name")]: current,
		}
	}, {});

	document.querySelectorAll("[data-open-modal]").forEach(modalOpnBtn => {
		// Динамические аргументы для передачи
		const dynamicArgs = JSON.parse(modalOpnBtn.getAttribute("data-modal-dynamic-args"));
		const modalName = modalOpnBtn.getAttribute("data-open-modal");

		// Открытие модалки
		modalOpnBtn.addEventListener("click", (e) => {
			lockWindowScroll();
			modals[modalName].classList.remove("modal-hidden");

			// Работа с аргументами

			// Аргументов нет
			if(!dynamicArgs) return;

			// Для картинки, либо this (берем src) или путь до картинки
			if(dynamicArgs["img"]) {
				const imgSrc = dynamicArgs["img"] === "this" ? modalOpnBtn.getAttribute("src") : dynamicArgs["img"];
				const imgNode = modals[modalName].querySelector(".modal-content_img");
				imgNode.setAttribute("src", imgSrc);
				imgNode.setAttribute("alt", modalOpnBtn.getAttribute("alt") ? modalOpnBtn.getAttribute("alt") : "")
			}
		});
	});
}

function lockWindowScroll() {
	document.body.style.overflow = "hidden";
}

function unlockWindowScroll() {
	document.body.style.overflow = "";
}

function loadMobileMenu() {
	if(!document.querySelector("[data-menu-btn]")) return;

	document.querySelector("[data-menu-btn]").addEventListener("click", (e) => {
		document.querySelectorAll("[data-menu-element]").forEach(el => {
			if(el.classList.contains("hidden")) {
				el.classList.remove('hidden');

                requestAnimationFrame(() => {
                    el.classList.remove('opacity-0');
                });
			} else {
				el.classList.add('opacity-0');

				setTimeout(() => el.classList.add('hidden'), 300);
			}
		});
	});
}

function loadShopFilter() {
	const productTypesObjs = [...document.querySelectorAll("[data-product-type]")];

	if(productTypesObjs.length === 0) return;

	const tags = productTypesObjs.filter((el) => el.getAttribute("data-product-type") === "tag");
	const productCards = productTypesObjs.filter((el) => el.getAttribute("data-product-type") === "product-card");

	tags.forEach(tag => tag.addEventListener("click", (e) => {
		tags.forEach(_ => _.classList.remove("!bg-brand"));
		tag.classList.add("!bg-brand");

		const tagType = tag.getAttribute("data-product-tag");

		if(tagType === "all") {
			productCards.forEach(card => card.classList.remove("hidden"));
		} else {
			productCards.forEach(card => {
				if(card.getAttribute("data-product-tag") === tagType) {
					card.classList.remove("hidden");
				} else {
					card.classList.add("hidden");
				}
			});
		}
	}))
}