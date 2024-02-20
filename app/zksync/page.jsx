"use client";
import React, {useEffect, useState} from 'react';
import {ProTable} from "@ant-design/pro-components";
import {Button, Input, message, Modal, Progress, Spin, Typography} from 'antd';
import getZksyncData from "@/services/zksync";

const {Text} = Typography;
const {TextArea} = Input;


const App = () => {
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [addresses, setAddresses] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const columns = [
        {
            title: '序号',
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
            render: (_, record, index) => <span style={{fontWeight: 'bold', color: 'blue'}}>{index + 1}</span>,
        },
        {
            title: '地址',
            dataIndex: 'address',
            key: 'address',
            width: 350,
            search: true,
        },
        {
            title: 'zkSync Lite',
            dataIndex: 'zksynclite',
            key: 'zksynclite',
            children: [
                {
                    title: 'ETH',
                    dataIndex: 'lite_eth',
                    key: 'lite_eth',
                    align: 'right',
                },
                {
                    title: 'TX',
                    dataIndex: 'lite_tx',
                    key: 'lite_tx',
                    align: 'right',
                },
            ],
        },
        {
            title: 'ETH Mainnet',
            dataIndex: 'mainnet',
            key: 'mainnet',
            children: [
                {
                    title: 'ETH',
                    dataIndex: 'mainnet_balance',
                    key: 'mainnet_balance',
                    align: 'right',
                },
                {
                    title: 'TX',
                    dataIndex: 'mainnet_tx',
                    key: 'mainnet_tx',
                    align: 'right',
                },
            ],
        },
        {
            title: 'zkSync Era',
            dataIndex: 'zksync',
            key: 'zksyncera',
            children: [
                {
                    title: 'ETH',
                    dataIndex: 'era_balance',
                    key: 'era_balance',
                    align: 'right',
                },
                {
                    title: 'TX',
                    dataIndex: 'era_tx',
                    key: 'era_tx',
                    align: 'right',
                },
                {
                    title: '日',
                    dataIndex: 'era_day',
                    key: 'era_day',
                    align: 'right',
                },
                {
                    title: '周',
                    dataIndex: 'era_week',
                    key: 'era_week',
                    align: 'right',
                },
                {
                    title: '月',
                    dataIndex: 'era_month',
                    key: 'era_month',
                    align: 'right',
                },
                {
                    title: '最后交易',
                    dataIndex: 'era_last_tx',
                    key: 'era_last_tx',
                    align: 'right',
                    width: 90,
                },
                {
                    title: 'VOL(E)',
                    dataIndex: 'era_vol',
                    key: 'era_vol',
                    align: 'right',
                },
                {
                    title: 'Gas(E)',
                    dataIndex: 'era_gas',
                    key: 'era_gas',
                    align: 'right',
                }
            ],
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            align: 'center',
            render: (_, record) => (
                <Button type="link" onClick={() => handleDelete(record.key)}>删除</Button>
            ),
        }
    ];

    const refreshSelectedData = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请先选择至少一个地址');
            return;
        }

        setLoading(true);
        for (const key of selectedRowKeys) {
            console.log(key)
            const itemIndex = data.findIndex(item => item.key === key);
            if (itemIndex !== -1) {
                const item = data[itemIndex];
                try {
                    console.log(item.address)
                    const updatedData = await getZksyncData(item.address);
                    console.log(updatedData)
                    data[itemIndex] = {...item, ...updatedData, address: item.address};
                } catch (error) {
                    console.error("Error updating data for address:", item.address, error);
                    message.error(`更新地址 ${item.address} 的数据时出错`);
                }
            }
            setData([...data]);
        }

        setLoading(false);
        setSelectedRowKeys([]); // 清空选择
        message.success('选中的地址数据已刷新');
    };

    const refreshAllData = async () => {
        setLoading(true);
        const total = data.length;
        let count = 0;
        for (const item of data) {
            try {
                const updatedData = await getZksyncData(item.address);
                const index = data.findIndex(x => x.address === item.address);
                if (index !== -1) {
                    data[index] = {...data[index], ...updatedData};
                }
                count++;
                setProgress((count / total) * 100);
            } catch (error) {
                console.error("Error updating data for address:", item.address, error);
            }
        }
        setData([...data]);
        setLoading(false);
        setSelectedRowKeys([]); // 清空选择
        message.success('所有地址的数据已刷新');
    };
    const handleDeleteSelected = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请先选择至少一个地址');
            return;
        }
        const newData = data.filter(item => !selectedRowKeys.includes(item.key));
        setData(newData);
        setSelectedRowKeys([]); // 清空选择
        message.success('选中的地址已删除');
    };
    useEffect(() => {
        const storedData = localStorage.getItem('zksyncData');
        if (storedData) {
            setData(JSON.parse(storedData));
        }
        setIsInitialLoad(false);
    }, []);

    useEffect(() => {
        if (!isInitialLoad) {
            localStorage.setItem('zksyncData', JSON.stringify(data));
        }
    }, [data, isInitialLoad]);
    const fetchData = async () => {
        setIsModalVisible(false);
        setLoading(true);
        const uniqueAddresses = new Set(addresses.split(/[\s,]+/).filter(Boolean));
        const total = uniqueAddresses.size;
        let count = 0;
        for (const address of uniqueAddresses) {
            const res = await getZksyncData(address);
            const index = data.findIndex(item => item.address === address);
            if (index > -1) {
                data[index] = res;
            } else {
                setData(data => [...data, res]);
            }
            count += 1;
            setProgress((count / total) * 100);
            if (count === total) {
                setLoading(false);
                message.success('所有地址的数据已更新');
            }
        }
    };
    const handleDelete = (key) => {
        const newData = data.filter(item => item.key !== key);
        setData(newData);
    }
    return (
        <>
            {loading && <Progress percent={Math.round(progress)}/>}
            <Spin spinning={loading} tip={`正在获取数据... `}>
                <ProTable
                    columns={columns}
                    dataSource={data}
                    rowKey="address"
                    bordered
                    pagination={{
                        showQuickJumper: true,
                    }}
                    search={false}
                    scroll={{x: 1300, y: 600}}
                    sticky
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                    }}
                    toolBarRender={() => [
                        <Button key="addAddress" onClick={() => setIsModalVisible(true)}>
                            添加地址
                        </Button>,
                        <Button key="refreshSelected" type="default" onClick={refreshSelectedData}>
                            刷新选中行数据
                        </Button>,
                        <Button key="refreshAll" onClick={refreshAllData}>
                            批量刷新所有数据
                        </Button>,
                        <Button key="deleteSelected" onClick={handleDeleteSelected}>删除选中地址</Button>,
                    ]}
                />
            </Spin>
            <Modal
                title="输入地址"
                open={isModalVisible}
                onOk={fetchData}
                onCancel={() => setIsModalVisible(false)}
                width={800}
            >
                <TextArea
                    placeholder="请输入地址，多个地址请用逗号、空格或换行符分隔"
                    value={addresses}
                    onChange={(e) => setAddresses(e.target.value)}
                    style={{height: 400}}
                />
            </Modal>
        </>
    );
};

export default App;
