import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const schema = z.object({
  nodeType: z.enum([
    "apiNode",
    "finalSuccessNode",
    "finalFailedNode",
  ]),
});

export type NewNodeFormValues = z.infer<typeof schema>;

interface NewNodeFormProps {
  onSubmit: (values: NewNodeFormValues) => void;
}

const options = [
  { value: "apiNode", label: "API Node" },
  { value: "finalSuccessNode", label: "Final Success Node" },
  { value: "finalFailedNode", label: "Final Failed Node" },
];

export function NewNodeForm({ onSubmit }: NewNodeFormProps) {
  const form = useForm<NewNodeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nodeType: "apiNode",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nodeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo do node</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-wrap gap-2"
                >
                  {options.map((option) => (
                    <Badge
                      key={option.value}
                      className={cn(
                        "cursor-pointer",
                        field.value === option.value
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-800"
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="sr-only"
                      />
                      <Label htmlFor={option.value} className="p-2 cursor-pointer">
                        {option.label}
                      </Label>
                    </Badge>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Adicionar</Button>
        </div>
      </form>
    </Form>
  );
}
