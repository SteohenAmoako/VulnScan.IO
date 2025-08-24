'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Search } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL including http:// or https://" }),
});

export function ScanForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const encodedUrl = encodeURIComponent(values.url);
    router.push(`/scan?url=${encodedUrl}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input placeholder="https://example.com" {...field} aria-label="Website URL" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" /> Scan
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
