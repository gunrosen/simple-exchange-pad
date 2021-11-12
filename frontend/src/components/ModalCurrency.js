import {Image, Modal} from "react-bootstrap";
import {Coins} from "../constants/constants";

const ModalCurrency = (props) => {
    const {show, setShow, alreadySetCurrency, handleSelectCurrency} = props;

    const handleSelect = (e,item) => {
        e.preventDefault();
        handleSelectCurrency(item);
        setShow(false);
    }

    return (
        <Modal
            centered
            size={"sm"}
            show={show}
            onHide={() => setShow(false)}
            dialogClassName="modal-90w"
            aria-labelledby="example-custom-modal-styling-title"
        >
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title id="example-custom-modal-styling-title">
                    Select a token
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    Coins.map((item, index) => {
                        if (alreadySetCurrency !=null && item.abbr !== alreadySetCurrency.abbr) {
                            return <div key={index} className="modal-currency-item" role="button" tabIndex={0}
                                        onClick={(e) => handleSelect(e, item)}>
                                <Image className="modal-currency-item-image" src={item.image}/>
                                <div className="modal-currency-item-info">
                                    <span className="modal-currency-item-abbr">{item.abbr}</span>
                                    <span className="modal-currency-item-name">{item.name}</span>
                                </div>
                            </div>
                        }
                    })
                }
            </Modal.Body>
        </Modal>
    );
}

export default ModalCurrency;