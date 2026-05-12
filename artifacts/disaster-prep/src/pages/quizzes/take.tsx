import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetQuiz, useSubmitQuiz, QuizAnswer } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, XCircle, ArrowRight, ArrowLeft, RefreshCcw, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function QuizTake() {
  const params = useParams<{ id: string }>();
  const quizId = parseInt(params.id || "0", 10);
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { data: quizWithQuestions, isLoading, isError } = useGetQuiz(quizId, {
    query: {
      enabled: !!quizId && !isNaN(quizId)
    }
  });

  const submitQuiz = useSubmitQuiz();

  const handleAnswerSelect = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (quizWithQuestions && currentQuestionIdx < quizWithQuestions.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!quizWithQuestions) return;
    
    // Check if all questions are answered
    const allAnswered = quizWithQuestions.questions.every(q => answers[q.id]);
    
    if (!allAnswered) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    const formattedAnswers: QuizAnswer[] = Object.entries(answers).map(([qId, ans]) => ({
      questionId: parseInt(qId, 10),
      answer: ans
    }));

    submitQuiz.mutate({
      id: quizId,
      data: { answers: formattedAnswers }
    }, {
      onSuccess: () => {
        setIsSubmitted(true);
        toast({
          title: "Quiz submitted",
          description: "Your results have been recorded.",
        });
      },
      onError: (error) => {
        toast({
          title: "Submission failed",
          description: "There was an error submitting your quiz. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !quizWithQuestions) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Quiz Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The quiz you're looking for doesn't exist.</p>
        <Link href="/quizzes">
          <Button>Back to Quizzes</Button>
        </Link>
      </div>
    );
  }

  const questions = quizWithQuestions.questions;
  
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-warning mb-4" />
        <h2 className="text-2xl font-bold">Empty Quiz</h2>
        <p className="text-muted-foreground mt-2 mb-6">This quiz has no questions yet.</p>
        <Link href="/quizzes">
          <Button>Back to Quizzes</Button>
        </Link>
      </div>
    );
  }

  // Submitted view
  if (isSubmitted && submitQuiz.data) {
    const result = submitQuiz.data;
    const isPassed = result.percentage >= 70;
    
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4 pt-8">
          <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center bg-card shadow-sm border">
            {isPassed ? (
              <Trophy className="h-12 w-12 text-yellow-500" />
            ) : (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isPassed ? "Congratulations!" : "Keep Practicing"}
          </h1>
          <p className="text-muted-foreground text-lg">
            You scored {result.score} out of {result.totalQuestions}
          </p>
        </div>

        <Card className="border-2 shadow-lg overflow-hidden">
          <div className="flex flex-col items-center justify-center p-8 bg-muted/30">
            <div className={`text-6xl font-extrabold ${isPassed ? 'text-success' : 'text-destructive'}`}>
              {result.percentage}%
            </div>
            <div className="mt-4 w-full max-w-md h-4 bg-muted rounded-full overflow-hidden border">
              <div 
                className={`h-full ${isPassed ? 'bg-success' : 'bg-destructive'}`} 
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </div>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center bg-card p-6">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.location.reload()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retake Quiz
            </Button>
            <Link href="/quizzes" className="w-full sm:w-auto">
              <Button className="w-full">
                Back to Quizzes
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Active taking view
  const currentQuestion = questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{quizWithQuestions.title}</h1>
        <div className="text-sm font-medium bg-muted px-3 py-1 rounded-full">
          Question {currentQuestionIdx + 1} of {questions.length}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/10 border-b pb-6">
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.questionText}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <RadioGroup 
            value={answers[currentQuestion.id] || ""} 
            onValueChange={(val) => handleAnswerSelect(currentQuestion.id, val)}
            className="space-y-3"
          >
            {[
              { id: 'A', text: currentQuestion.optionA },
              { id: 'B', text: currentQuestion.optionB },
              { id: 'C', text: currentQuestion.optionC },
              { id: 'D', text: currentQuestion.optionD }
            ].map((option) => (
              <div key={option.id} className="relative">
                <RadioGroupItem 
                  value={option.id} 
                  id={`option-${option.id}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`option-${option.id}`}
                  className={`
                    flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border-2 p-4 cursor-pointer hover:bg-muted/50 transition-colors
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                  `}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-primary/30 text-xs font-bold text-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
                    {option.id}
                  </div>
                  <span className="text-base font-normal">{option.text}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/20 p-4">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentQuestionIdx === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentQuestionIdx === questions.length - 1 ? (
            <Button 
              onClick={handleSubmit} 
              disabled={submitQuiz.isPending || answeredCount < questions.length}
              className={answeredCount === questions.length ? "animate-pulse-subtle bg-success hover:bg-success/90" : ""}
            >
              Submit Answers
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>{answeredCount} of {questions.length} answered</span>
      </div>
    </div>
  );
}
