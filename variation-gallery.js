(function ($) {
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

	$(".");
})(jQuery);
