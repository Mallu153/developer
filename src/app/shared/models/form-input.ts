export interface FormInput {
  ui: Ui;
  oce: boolean;
  name: string;
  type: string;
  source: Source[];
  status: string;
  typeId: number;
  default: boolean;
  options: string;
  service: string;
  category: string;
  configId: number;
  createdBy: number;
  isPricing: number;
  validators: Validators;
  createdDate: string;
  multiselect: boolean;
  defaultValue: string;
  dependentField: string;
}

interface Validators {
  max: number;
  min: number;
  maxDate: string;
  minDate: string;
  required: boolean;
  maxLength: number;
  minLength: number;
  isSpecialCharacters: number;
}

interface Source {
  text: string;
  value: string;
}

interface Ui {
  hint: string;
  info: string;
  label: string;
  newRow: boolean;
  placeholder: string;
  mobileColumn: number;
  mobileOffset: string;
  backendColumn: number;
  backendOffset: string;
  desktopColumn: number;
  desktopOffset: string;
}
