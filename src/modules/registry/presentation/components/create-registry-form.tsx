"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import type { z } from "zod";
import { createRegistrySchema } from "../../application/schemas/create-registry.schema";
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";

const formSchema = createRegistrySchema;

export function CreateRegistryForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Handle form submission
        console.log(values)
    };



    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FieldGroup>
                <Controller
                    name="title"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                            <Input {...field} aria-invalid={fieldState.invalid} />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                            <Input {...field} aria-invalid={fieldState.invalid} />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

            </FieldGroup>
            <Button type="submit">Submit</Button>
        </form>
    )
}
