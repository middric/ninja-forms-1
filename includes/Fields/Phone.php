<?php if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Class NF_Fields_Phone
 */
class NF_Fields_Phone extends NF_Fields_Textbox
{
    protected $_name = 'phone';

    protected $_nicename = 'Phone';

    protected $_group = 'user_info';

    protected $_type = 'tel';

    public function __construct()
    {
        $this->_nicename = __( 'Phone', Ninja_Forms::TEXTDOMAIN );
    }

    public function validate( $value )
    {
        parent::validate( $value );
    }

}