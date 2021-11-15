import { Table} from "react-bootstrap";

const TestRepstenInfo = () => {
    return (
        <div className="test-resten-info">
            <div>
                For Testing in ropsten
            </div>
            <Table striped bordered hover size="sm" responsive="sm">
                <thead>
                <tr>
                    <th>Content</th>
                    <th>Address</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Token-X</td>
                    <td>{process.env.REACT_APP_ADDRESS_TOKEN_X}</td>
                </tr>
                <tr>
                    <td>Token-Y</td>
                    <td>{process.env.REACT_APP_ADDRESS_TOKEN_Y}</td>
                </tr>
                <tr>
                    <td>Simple Exchange</td>
                    <td>{process.env.REACT_APP_ADDRESS_SIMPLE_EXCHANGE}</td>
                </tr>
                <tr>
                    <td>User test</td>
                    <td>{process.env.REACT_APP_USER_TEST}</td>
                </tr>
                <tr>
                    <td>User test private key</td>
                    <td>{process.env.REACT_APP_PRIVATE_KEY_USER_TEST}</td>
                </tr>
                </tbody>
            </Table>
        </div>
    )
}
export default TestRepstenInfo;