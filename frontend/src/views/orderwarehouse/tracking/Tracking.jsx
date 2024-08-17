import React, { useState, useEffect } from 'react';
import { classNames } from 'primereact/utils';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Slider } from 'primereact/slider';
import { Tag } from 'primereact/tag';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { CustomerService } from './service/CustomerService';
import 'primereact/resources/themes/mira/theme.css';
import 'primereact/resources/primereact.min.css';

const Tracking = () => {
    const [customers, setCustomers] = useState([]);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [representatives] = useState([
        { name: 'Amy Elsner', image: 'amyelsner.png' },
        { name: 'Anna Fali', image: 'annafali.png' },
        { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
        { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
        { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
        { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
        { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
        { name: 'Onyama Limba', image: 'onyamalimba.png' },
        { name: 'Stephen Shaw', image: 'stephenshaw.png' },
        { name: 'XuXue Feng', image: 'xuxuefeng.png' }
    ]);
    const [statuses] = useState(['unqualified', 'qualified', 'new', 'negotiation', 'renewal']);

    useEffect(() => {
        setLoading(true);
        CustomerService.getCustomersMedium()
            .then((data) => {
                setCustomers(getCustomers(data));
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                // Tangani kesalahan di sini (misalnya, tampilkan notifikasi)
            });
        initFilters();
    }, []);

    const getCustomers = (data) => {
        return (data || []).map((d) => ({
            ...d,
            date: new Date(d.date)
        }));
    };

    const formatDate = (value) => value.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const formatCurrency = (value) => value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });

    const clearFilter = () => initFilters();

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters(prevFilters => ({
            ...prevFilters,
            global: { value, matchMode: FilterMatchMode.CONTAINS }
        }));
        setGlobalFilterValue(value);
    };

    const initFilters = () => {
        setFilters({
            global: { value: '', matchMode: FilterMatchMode.CONTAINS },
            name: { operator: FilterOperator.AND, constraints: [{ value: '', matchMode: FilterMatchMode.STARTS_WITH }] },
            'country.name': { operator: FilterOperator.AND, constraints: [{ value: '', matchMode: FilterMatchMode.STARTS_WITH }] },
            representative: { value: null, matchMode: FilterMatchMode.IN },
            date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
            balance: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
            verified: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue('');
    };

    const renderHeader = () => (
        <div className="flex justify-content-between">
            <Button type="button" icon="pi pi-filter-slash" label="Bersihkan" outlined onClick={clearFilter} />
            <div className="flex align-items-center gap-2">
                <InputIcon className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Cari dengan kata kunci" />
            </div>
        </div>
    );

    const countryBodyTemplate = (rowData) => (
        <div className="flex align-items-center gap-2">
            <img alt="flag" src={`https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png`} className={`flag flag-${rowData.country.code}`} style={{ width: '24px' }} />
            <span>{rowData.country.name}</span>
        </div>
    );

    const filterClearTemplate = (options) => (
        <Button type="button" icon="pi pi-times" onClick={options.filterClearCallback} severity="secondary"></Button>
    );

    const filterApplyTemplate = (options) => (
        <Button type="button" icon="pi pi-check" onClick={options.filterApplyCallback} severity="success"></Button>
    );

    const filterFooterTemplate = () => (
        <div className="px-3 pt-0 pb-3 text-center">Filter berdasarkan Negara</div>
    );

    const representativeBodyTemplate = (rowData) => {
        const representative = rowData.representative;
        return (
            <div className="flex align-items-center gap-2">
                <img alt={representative.name} src={`https://primefaces.org/cdn/primereact/images/avatar/${representative.image}`} width="32" />
                <span>{representative.name}</span>
            </div>
        );
    };

    const representativeFilterTemplate = (options) => (
        <MultiSelect
            value={options.value}
            options={representatives}
            itemTemplate={representativesItemTemplate}
            onChange={(e) => options.filterCallback(e.value)}
            optionLabel="name"
            placeholder="Semua"
            className="p-column-filter"
        />
    );

    const representativesItemTemplate = (option) => (
        <div className="flex align-items-center gap-2">
            <img alt={option.name} src={`https://primefaces.org/cdn/primereact/images/avatar/${option.image}`} width="32" />
            <span>{option.name}</span>
        </div>
    );

    const dateBodyTemplate = (rowData) => formatDate(rowData.date);

    const dateFilterTemplate = (options) => (
        <Calendar
            value={options.value}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            dateFormat="dd/mm/yy"
            placeholder="dd/mm/yyyy"
            mask="99/99/9999"
        />
    );

    const balanceBodyTemplate = (rowData) => formatCurrency(rowData.balance);

    const balanceFilterTemplate = (options) => (
        <InputNumber
            value={options.value}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            mode="currency"
            currency="IDR"
            locale="id-ID"
        />
    );

    const statusBodyTemplate = (rowData) => <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;

    const statusFilterTemplate = (options) => (
        <Dropdown
            value={options.value}
            options={statuses}
            onChange={(e) => options.filterCallback(e.value)}
            placeholder="Pilih status"
        />
    );

    const getSeverity = (status) => {
        switch (status) {
            case 'qualified':
                return 'success';
            case 'unqualified':
                return 'danger';
            case 'new':
                return 'warning';
            case 'negotiation':
                return 'info';
            case 'renewal':
                return 'secondary';
            default:
                return null;
        }
    };

    return (
        <div className="datatable-crud-demo">
            <div className="card">
                <DataTable
                    value={customers}
                    filters={filters}
                    globalFilterFields={['name', 'country.name', 'representative.name', 'status']}
                    header={renderHeader()}
                    loading={loading}
                >
                    <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                    <Column field="country.name" header="Country" body={countryBodyTemplate} filter filterPlaceholder="Search by country" filterClearTemplate={filterClearTemplate} filterApplyTemplate={filterApplyTemplate} filterFooterTemplate={filterFooterTemplate} />
                    <Column field="representative" header="Representative" body={representativeBodyTemplate} filter filterElement={representativeFilterTemplate} />
                    <Column field="date" header="Date" body={dateBodyTemplate} filter filterElement={dateFilterTemplate} />
                    <Column field="balance" header="Balance" body={balanceBodyTemplate} filter filterElement={balanceFilterTemplate} />
                    <Column field="status" header="Status" body={statusBodyTemplate} filter filterElement={statusFilterTemplate} />
                </DataTable>
                {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
            </div>
        </div>
    );
};

export default Tracking;
