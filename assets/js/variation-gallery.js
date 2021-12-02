(function ($) {
	/**
	 * Updates IDs of currently existing images in gallery
	 * @param {Object} galleryImageContainer
	 * @returns int idArray
	 */
	function updateIDs(galleryImageContainer) {
		// array with image IDs
		const idArray = [];
		galleryImageContainer.children("li").each(function () {
			idArray.push($(this).data("img-id"));
		});

		// convert array to string and update hidden input element
		const string = idArray.join(",");
		$('.variation-gallery input[type="hidden"]').val(string);

		// allows to save or cancel on change; based on function input_changed in file meta-boxes-product.js in woocommerce/assets/js/admin
		$(galleryImageContainer)
			.closest(".woocommerce_variation")
			.addClass("variation-needs-update");
		$("button.cancel-variation-changes, button.save-variation-changes").prop("disabled", false);
		$("#variable_product_options").trigger("woocommerce_variations_input_changed");

		return idArray;
	}

	/**
	 * Eventlistener for Add images button
	 */
	$("body").on("click", ".vg-upload", function (e) {
		e.preventDefault();

		const gallery = $(e.target).closest(".variation-gallery");
		const galleryImageContainer = gallery.find(".variation-gallery__images");

		// wp media object
		const custom_uploader = wp
			.media({
				title: "Insert image",
				library: {
					type: "image",
				},
				button: {
					text: "Upload to gallery", // button label text
				},
				multiple: true,
			})
			.on("select", function () {
				const imagesArray = custom_uploader.state().get("selection").toJSON();

				imagesArray.forEach((img) => {
					galleryImageContainer.append(
						`<li class="variation-gallery__image-wrapper" data-img-id="${img.id}">
                            <img class="variation-gallery__image" src="${img.sizes.thumbnail.url}" loading="lazy" />
                            <div class="variation-gallery__remove-image-container">
                                <span class="dashicons dashicons-no-alt variation-gallery__remove-image-btn"></span>
                            </div>
                        </li>`
					);
				});

				updateIDs(galleryImageContainer);
			})
			.open();
	});

	/**
	 * Eventlistener for remove image button
	 */
	$("body").on("click", "span.variation-gallery__remove-image-btn", function (e) {
		const imageToRemove = $(e.target).closest("li.variation-gallery__image-wrapper");
		const gallery = $(e.target).closest(".variation-gallery");
		const galleryImageContainer = gallery.find(".variation-gallery__images");

		imageToRemove.fadeOut(300, function () {
			$(this).remove();
			updateIDs(galleryImageContainer);
		});
	});

	/**
	 * Runs when variations are loaded - applies sortable
	 */
	$("#woocommerce-product-data").on("woocommerce_variations_loaded", variations_loaded);

	function variations_loaded() {
		$(".variation-gallery__images").sortable({
			items: "li.variation-gallery__image-wrapper",
			cursor: "move",
			scrollSensitivity: 40,
			forcePlaceholderSize: true,
			forceHelperSize: false,
			helper: "clone",
			opacity: 0.65,
			placeholder: "wc-metabox-sortable-placeholder",
			stop: function (event, ui) {
				const gallery = $(event.target).closest(".variation-gallery");
				const galleryImageContainer = gallery.find(".variation-gallery__images");

				updateIDs(galleryImageContainer);
			},
		});
	}
})(jQuery);
