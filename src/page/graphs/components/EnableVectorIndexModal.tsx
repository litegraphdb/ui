'use client';
import React, { useEffect, useState } from 'react';
import { Form, message } from 'antd';
import LitegraphModal from '@/components/base/modal/Modal';
import LitegraphFormItem from '@/components/base/form/FormItem';
import LitegraphInput from '@/components/base/input/Input';
import { useEnableVectorIndexMutation, useReadVectorIndexConfigurationQuery } from '@/lib/store/slice/slice';
import { validateVectorIndexFile } from './constant';
import { VectorIndexData, EnableVectorIndexModalProps } from './types';
import PageLoading from '@/components/base/loading/PageLoading';
import LitegraphSelect from '@/components/base/select/Select';



const EnableVectorIndexModal = ({
    isEnableVectorIndexModalVisible,
    setIsEnableVectorIndexModalVisible,
    graphId,
    onSuccess,
    viewMode = false
}: EnableVectorIndexModalProps) => {
    const [form] = Form.useForm<VectorIndexData>();
    const [formValid, setFormValid] = useState(false);
    const [enableVectorIndex, { isLoading: isCreatingVectorIndex }] = useEnableVectorIndexMutation();
    const { data: vectorIndexConfig, isLoading: isL1, isFetching } = useReadVectorIndexConfigurationQuery(graphId, { skip: !viewMode });
    const isVectorIndexConfigLoading = isL1 || isFetching;
    // Add form validation watcher
    const [formValues, setFormValues] = useState({});
    useEffect(() => {
        form
            .validateFields({ validateOnly: true })
            .then(() => setFormValid(true))
            .catch(() => setFormValid(false));
    }, [formValues, form]);

    useEffect(() => {
        if (isEnableVectorIndexModalVisible && !viewMode) {
            form.resetFields();
            form.setFieldsValue({
                VectorIndexType: 'HnswSqlite',
                VectorIndexThreshold: null,
                VectorDimensionality: 1536,
                VectorIndexM: 16,
                VectorIndexEf: 100,
                VectorIndexEfConstruction: 200,
            });
        } else if (isEnableVectorIndexModalVisible && viewMode) {
            form.setFieldsValue(vectorIndexConfig || {});
        }
    }, [isEnableVectorIndexModalVisible, form, viewMode, vectorIndexConfig]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await enableVectorIndex({
                graphId: graphId, request: {
                    VectorIndexType: values.VectorIndexType,
                    VectorIndexFile: values.VectorIndexFile,
                    VectorDimensionality: Number(values.VectorDimensionality),
                    VectorIndexM: Number(values.VectorIndexM),
                    VectorIndexEf: Number(values.VectorIndexEf),
                    VectorIndexEfConstruction: Number(values.VectorIndexEfConstruction),
                    VectorIndexThreshold: Number(values.VectorIndexThreshold),
                }
            }).unwrap();

            setIsEnableVectorIndexModalVisible(false);
            form.resetFields();
            onSuccess();
            message.success('Vector index enabled successfully');
        } catch (error) {
            console.error('Failed to enable vector index:', error);
            message.error('Failed to enable vector index');
        }
    };

    const handleCancel = () => {
        setIsEnableVectorIndexModalVisible(false);
        form.resetFields();
    };


    return (
        <LitegraphModal
            title="Enable Vector Index"
            open={isEnableVectorIndexModalVisible}
            onOk={handleSubmit}
            onCancel={handleCancel}
            confirmLoading={isCreatingVectorIndex}
            okButtonProps={{ disabled: !formValid }}
            data-testid="enable-vector-index-modal"
            width={800}
        >
            {(viewMode && isVectorIndexConfigLoading) ? <PageLoading /> : <Form
                form={form}
                layout="vertical"
                onValuesChange={(_, allValues) => setFormValues(allValues)}
                requiredMark={!viewMode}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <LitegraphFormItem
                        label="Vector Index Type"
                        name="VectorIndexType"
                        rules={[{ required: true, message: 'Please select Vector Index Type!' }]}
                    >
                        <LitegraphSelect
                            readonly={viewMode}
                            placeholder="Select Vector Index Type"
                            options={[
                                { label: 'HnswSqlite', value: 'HnswSqlite' },
                                { label: 'HnswMemory', value: 'HnswMemory' },
                                { label: 'IvfFlat', value: 'IvfFlat' },
                                { label: 'IvfSq', value: 'IvfSq' },
                            ]}
                            variant={viewMode ? 'borderless' : 'outlined'}
                        />
                    </LitegraphFormItem>

                    <LitegraphFormItem
                        label="Vector Index File"
                        name="VectorIndexFile"
                        rules={[
                            { required: true, message: 'Please input Vector Index File!' },
                            { validator: validateVectorIndexFile },
                        ]}
                        extra={!viewMode ? <small>File should end with .db and should not contain spaces</small> : null}
                    >
                        <LitegraphInput
                            readOnly={viewMode}
                            placeholder="e.g., graph-00000000-0000-0000-0000-000000000000-hnsw.db"
                            variant={viewMode ? 'borderless' : 'outlined'}
                        />
                    </LitegraphFormItem>

                    <LitegraphFormItem
                        label="Vector Index Threshold"
                        name="VectorIndexThreshold"
                    >
                        <LitegraphInput
                            readOnly={viewMode}
                            type="number"
                            placeholder="Enter threshold"
                            variant={viewMode ? 'borderless' : 'outlined'}
                        />
                    </LitegraphFormItem>

                    <LitegraphFormItem
                        label="Vector Dimensionality"
                        name="VectorDimensionality"
                        rules={[
                            { required: true, message: 'Please input Vector Dimensionality!' },
                        ]}
                    >
                        <LitegraphInput
                            readOnly={viewMode}
                            type="number"
                            placeholder="Enter dimensionality (e.g., 1536)"
                            min={1}
                            variant={viewMode ? 'borderless' : 'outlined'}
                        />
                    </LitegraphFormItem>

                    <LitegraphFormItem
                        label="Vector Index M"
                        name="VectorIndexM"
                        rules={[
                            { required: true, message: 'Please input Vector Index M!' },
                        ]}
                        extra={!viewMode ? <small>Number of connections per layer in HNSW index</small> : null}
                    >
                        <LitegraphInput
                            readOnly={viewMode}
                            type="number"
                            placeholder="Enter M value (e.g., 16)"
                            min={1}
                            variant={viewMode ? 'borderless' : 'outlined'}
                        />
                    </LitegraphFormItem>

                    <LitegraphFormItem
                        label="Vector Index Ef"
                        name="VectorIndexEf"
                        rules={[
                            { required: true, message: 'Please input Vector Index Ef!' },
                        ]}
                        extra={!viewMode ? <small>Search parameter for HNSW index</small> : null}
                    >
                        <LitegraphInput
                            readOnly={viewMode}
                            type="number"
                            placeholder="Enter Ef value (e.g., 100)"
                            min={1}
                            variant={viewMode ? 'borderless' : 'outlined'}
                        />
                    </LitegraphFormItem>

                    <LitegraphFormItem
                        label="Vector Index Ef Construction"
                        name="VectorIndexEfConstruction"
                        rules={[
                            { required: true, message: 'Please input Vector Index Ef Construction!' },
                        ]}
                        extra={!viewMode ? <small>Construction parameter for HNSW index</small> : null}
                    >
                        <LitegraphInput
                            readOnly={viewMode}
                            type="number"
                            placeholder="Enter Ef Construction value (e.g., 200)"
                            min={1}
                            variant={viewMode ? 'borderless' : 'outlined'}
                        />
                    </LitegraphFormItem>
                </div>
            </Form>}
        </LitegraphModal>
    );
};

export default EnableVectorIndexModal;
