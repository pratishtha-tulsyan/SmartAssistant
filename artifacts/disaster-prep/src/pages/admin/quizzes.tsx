import { useState } from "react";
import { 
  useListQuizzes, 
  useCreateQuiz, 
  useAddQuestion,
  QuizInputCategory 
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, Plus, FileQuestion, Layers } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

const quizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.nativeEnum(QuizInputCategory),
});

const questionSchema = z.object({
  questionText: z.string().min(5, "Question must be at least 5 characters"),
  optionA: z.string().min(1, "Required"),
  optionB: z.string().min(1, "Required"),
  optionC: z.string().min(1, "Required"),
  optionD: z.string().min(1, "Required"),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
});

export default function AdminQuizzes() {
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  
  const { data: quizzes, isLoading } = useListQuizzes();
  const createQuiz = useCreateQuiz();
  const addQuestion = useAddQuestion();

  const quizForm = useForm<z.infer<typeof quizSchema>>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "earthquake",
    },
  });

  const questionForm = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
    },
  });

  const onQuizSubmit = (data: z.infer<typeof quizSchema>) => {
    createQuiz.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Quiz created successfully" });
        setIsQuizDialogOpen(false);
        quizForm.reset();
        queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      },
      onError: () => toast({ title: "Failed to create quiz", variant: "destructive" })
    });
  };

  const onQuestionSubmit = (data: z.infer<typeof questionSchema>) => {
    if (!selectedQuizId) return;

    addQuestion.mutate({ id: selectedQuizId, data }, {
      onSuccess: () => {
        toast({ title: "Question added successfully" });
        setIsQuestionDialogOpen(false);
        questionForm.reset();
        queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      },
      onError: () => toast({ title: "Failed to add question", variant: "destructive" })
    });
  };

  const handleAddQuestionClick = (quizId: number) => {
    setSelectedQuizId(quizId);
    questionForm.reset();
    setIsQuestionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Quizzes</h1>
          <p className="text-muted-foreground">Create assessments and add questions.</p>
        </div>
        
        <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
              <DialogDescription>
                Define the container for a new set of assessment questions.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...quizForm}>
              <form onSubmit={quizForm.handleSubmit(onQuizSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={quizForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiz Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Earthquake Protocols Test" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={quizForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(QuizInputCategory).map((type) => (
                            <SelectItem key={type} value={type}>
                              <span className="capitalize">{type}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={quizForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What will this quiz cover?" 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsQuizDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createQuiz.isPending}>Create Quiz</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Question Add Dialog */}
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Question</DialogTitle>
              <DialogDescription>
                Add a new multiple-choice question to this quiz.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...questionForm}>
              <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={questionForm.control}
                  name="questionText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What is the first thing you should do when..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={questionForm.control}
                    name="optionA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option A</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={questionForm.control}
                    name="optionB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option B</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={questionForm.control}
                    name="optionC"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option C</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={questionForm.control}
                    name="optionD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option D</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={questionForm.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem className="pt-2 border-t mt-4">
                      <FormLabel className="text-primary font-bold">Correct Answer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-primary/50">
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A">Option A</SelectItem>
                          <SelectItem value="B">Option B</SelectItem>
                          <SelectItem value="C">Option C</SelectItem>
                          <SelectItem value="D">Option D</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={addQuestion.isPending}>Save Question</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : quizzes && quizzes.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Quiz Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Questions</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[280px]" title={quiz.title}>
                        {quiz.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {quiz.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        <Layers className="mr-1 h-3 w-3" />
                        {quiz.questionCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {format(new Date(quiz.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleAddQuestionClick(quiz.id)}>
                        <FileQuestion className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <HelpCircle className="h-10 w-10 opacity-20 mb-3" />
              <p>No quizzes found. Create one to start building assessments.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
