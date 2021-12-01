<?php
/*
Plugin Name: Woo Variation Gallery plugin
Description: Adding gallery to product variations in woocommerce
Version: 0.1
Author: Tomas Macek
Author URI: https://www.tomasmacek.eu
*/


class VariationGallery
{
    public function __construct()
    {
        $this->addHooksAndFilters();
    }

    public function addHooksAndFilters()
    {
        add_action('woocommerce_product_after_variable_attributes', [$this, 'variation_settings_fields'], 10, 3);
        add_action('woocommerce_save_product_variation', [$this, 'save_variation_gallery'], 10, 2);
        add_filter('woocommerce_available_variation', [$this, 'load_variation_gallery']);

        // scripts
        add_action('admin_enqueue_scripts', [$this, 'loadScriptsAndStyles']);
    }

    public function loadScriptsAndStyles()
    {
        if (is_admin() && isset($_GET['post']) && get_post_type($_GET['post']) == "product") {
            wp_enqueue_script('variation-gallery', plugins_url(basename(plugin_dir_path(__FILE__)) . '/variation-gallery.js', basename(__FILE__)), ['jquery'], null, true);
            wp_enqueue_style('admin-styles', plugins_url(basename(plugin_dir_path(__FILE__)) . '/variation-gallery-admin.css'));
        }
    }


    /**
     * Receives data from woocommerce_product_after_variable_attributes hooks and sends fields
     *
     * @param int $loop
     * @param object $variation_data
     * @param object $variation
     * @return void
     */
    public function variation_settings_fields($loop, $variation_data, $variation)
    {
        $this->variation_gallery_HTML(
            array(
                'id'            => "variation_gallery{$loop}",
                'name'          => "variation_gallery[{$loop}]",
                'value'         => get_post_meta($variation->ID, 'variation_gallery', true),
                'label'         => __('Variation gallery'),
                'desc_tip'      => true,
                'description'   => __('Add images which will be associated with this variant.'),
                'wrapper_class' => 'form-row form-row-full variation-gallery',
                'loop'          => $loop
            )
        );
    }

    /**
     * Generated admin HTML based on passed fields
     *
     * @param array $fields
     * @return void
     */
    public function variation_gallery_HTML($fields)
    {
?>
        <div class="<?php echo $fields['wrapper_class'] ?>" data-loop="<?php echo $fields['loop'] ?>">
            <p class="label"><?php _e('Variation Gallery'); ?></p>
            <div class="variation-gallery__wrapper">
                <ul class="variation-gallery__images ui-sortable">

                    <?php if ($fields['value']) : $id_array = explode(',', $fields['value']);
                        foreach ($id_array as $id) { ?>
                            <li class="variation-gallery__image-wrapper" data-img-id="<?php echo $id; ?>">
                                <img class="variation-gallery__image" src="<?php echo wp_get_attachment_image_src($id, "thumbnail")[0]; ?>" alt="" loading="lazy">
                                <div class="variation-gallery__remove-image-container">
                                    <span class="dashicons dashicons-no-alt variation-gallery__remove-image-btn"></span>
                                </div>
                            </li>
                    <?php }
                    endif; ?>

                </ul>
            </div>
            <div class="variation-gallery__links">
                <a href="#" class="vg-upload"><?php _e('Upload image'); ?> </a>
                <input type="hidden" name="<?php echo $fields['name'] ?>" id="<?php echo $fields['id'] ?>" value="<?php echo $fields['value'] ?>">
            </div>
        </div>
<?php
    }

    /**
     * Saves the field
     *
     * @param int $variation_id
     * @param int $loop
     * @return void
     */
    public function save_variation_gallery($variation_id, $loop)
    {
        $inputValue = $_POST['variation_gallery'][$loop];

        if (!empty($inputValue)) {
            update_post_meta($variation_id, 'variation_gallery', esc_attr($inputValue));
        }
    }
}

$variationGallery = new VariationGallery();


/**
 * Get all images in variation gallery based on variation id
 *
 * @param int $variation_id
 * @param string $size
 * @return array $imageURLArray
 */
function get_variation_gallery_images($variation_id, $size = "thumbnail")
{
    $imageIDs = explode(',', get_post_meta($variation_id, 'variation_gallery', true));

    foreach ($imageIDs as $singleImage) {
        $imageURLArray[] = wp_get_attachment_image_src($singleImage, $size)[0];
    }

    return $imageURLArray;
}
