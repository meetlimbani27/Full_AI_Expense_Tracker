"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"


export default function Home() {
  const { toast } = useToast()
  const [expense, setExpense] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
      try {
          setLoading(true);
          const res = await axios.post('http://localhost:8000/api/expenses/add', { expense });
          setLoading(false);
          setResult(res.data.result);
          toast({
            description: res.data.message,
            variant: 'default',
        })
      } catch (error) {
          console.error('Error sending response:', error);
      }
  };

  return (
    <section className="m-10 flex flex-col gap-4">
      <Label htmlFor="expense" className="text-[#e6e0e0] font-bold">Enter Your Expense :</Label>
      <Input 
        id="expense" 
        className="bg-[#e6e0e0] border-2 border-[#A7D477]" 
        type="text"
        value={expense}
        onChange={(e) => setExpense(e.target.value)}
      />
      <Button variant={"outline"} onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></span>
            Sending...
          </span>
        ) : (
          "Send Expense"
        )}
      </Button>
      <div className='text-[#e6e0e0] font-bold'>{result}</div>
    </section>
  );
}
