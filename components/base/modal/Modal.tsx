import { Modal, ModalProps } from 'antd';
import React from 'react';

export type LitegraphModalProps = ModalProps & {};
const LitegraphModal = (props: LitegraphModalProps) => {
  return <Modal {...props} />;
};

export default LitegraphModal;
