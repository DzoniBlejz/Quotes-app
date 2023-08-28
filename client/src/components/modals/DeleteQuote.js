import { useDisclosure } from "@mantine/hooks";
import { Modal, Button, Group } from "@mantine/core";

import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

function DeleteQuoteDialog(props) {
	const [opened, { close, open }] = useDisclosure(false);

	return (
		<>
			<Modal opened={opened} onClose={close} size="auto" title="">
				<Alert
					icon={<IconAlertCircle size="1rem" />}
					title="Warning!"
					color="red"
				>
					Da li stvarno zelite da obrisete ovaj citat?
				</Alert>
				<Group
					style={{ display: "flex", justifyContent: "flex-end", gap: "2rem" }}
				>
					<Button
						onClick={() => {
							props.onDeleteQuote(+props.id);
							close();
						}}
					>
						Da
					</Button>
					<Button onClick={close}>Ne</Button>
				</Group>
			</Modal>
			<button onClick={open}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="icon icon-tabler icon-tabler-trash"
					width="22"
					height="20"
					viewBox="0 0 24 24"
					strokeWidth="2"
					stroke="currentColor"
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
					<path d="M4 7l16 0"></path>
					<path d="M10 11l0 6"></path>
					<path d="M14 11l0 6"></path>
					<path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
					<path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
				</svg>
			</button>
		</>
	);
}

export default DeleteQuoteDialog;
