import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RadioGroup } from "@radix-ui/react-radio-group";

const colors = ["bg-blue-200", "bg-green-200", "bg-red-200"];

const initialNodeFormSchema = z.object({
  label: z
    .string()
    .min(2, "Label deve conter ao menos 2 caracteres.")
    .max(20, "Label deve conter no máximo 20 caracteres."),
  description: z
    .string()
    .min(2, "Descrição deve conter ao menos 2 caracteres.")
    .max(20, "Descrição deve conter no máximo 20 caracteres."),
  bgClass: z.string(),
});

export type InitialNodeFormValues = z.infer<
  typeof initialNodeFormSchema
>;

interface InitialNodeFormProps {
  onSubmit: (values: InitialNodeFormValues) => void;
}

export function InitialNodeForm({ onSubmit }: InitialNodeFormProps) {
  const form = useForm<InitialNodeFormValues>({
    resolver: zodResolver(initialNodeFormSchema),
    defaultValues: {
      label: "",
      description: "",
      bgClass: colors[0],
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="bgClass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor de fundo</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4"
                >
                  {colors.map((color) => (
                    <div key={color}>
                      <RadioGroupItem
                        value={color}
                        id={color}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={color}
                        className={cn(
                          "w-6 h-6 rounded-full cursor-pointer ring-2 transition",
                          color,
                          field.value === color
                            ? "ring-black"
                            : "ring-transparent"
                        )}
                      />
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite seu label"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite sua descrição"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit">Adicionar</Button>
        </div>
      </form>
    </Form>
  );
}
