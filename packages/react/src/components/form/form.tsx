/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 */
"use client";

import type {ComponentPropsWithRef} from "react";

import React from "react";
import {Form as FormPrimitive} from "react-aria-components/Form";

/* -------------------------------------------------------------------------------------------------
 * Form Root
 * -----------------------------------------------------------------------------------------------*/
interface FormRootProps extends ComponentPropsWithRef<typeof FormPrimitive> {}

const FormRoot = ({...props}: FormRootProps) => {
  return <FormPrimitive {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {FormRoot};

export type {FormRootProps};
