#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <math.h>


FILE *fptr;


int id = 0;
int lastWord= 0;
int userInputLock = 0;
int fileLock = 0;
int userOutputLock = 0;
int varCounts[3];
int codeCounts[3];
int quantumLeft = 3;
int quantum = 3;
int clock = 0;
int sched_code = 0;

struct Process {
    int pid;                
    char state[50];         
    int priority;           
    int pc;      
    int lowerBound; 
    int upperBound; 
    char code[11][100]; //awaiting wedding suns's confirmation ...
    char vars[3][50];
};

//QUEUES AND SCHEDULERS
struct Queue {
    int items[3];
    int front;
    int rear;
};

// Function to initialize the queue
void initializeQueue(struct Queue* q){
    q->front = -1;
    q->rear = -1;
    for (int i = 0; i < 3; i++) {
        q->items[i] = -1;
    }
}

// Function to check if the queue is empty
int isEmpty(struct Queue* q) {   return q->front == -1; }

// Function to check if the queue is full
int isFull(struct Queue* q) {  return ((q->rear + 1) % 3) == q->front; }

// Function to add an element to the queue (Enqueue
// operation)
void enqueue(struct Queue* q, int value)
{
    if (isFull(q) == 1) {
        // printf("Queue is full\n");
        return;
    }
    if (isEmpty(q) == 1) {
        q->front = 0;
    }
    q->rear = (q->rear + 1) % 3;
    q->items[q->rear] = value;
}

// Function to remove an element from the queue (Dequeue
// operation)
int dequeue(struct Queue* q)
{
    if (isEmpty(q) == 1) {
        return -1;
    }
    int value = q->items[q->front];
    if (q->front == q->rear) {
        q->front = q->rear = -1; // Queue becomes empty
    } else {
        q->front = (q->front + 1) % 3;
    }
    return value;
}

// Function to get the element at the front of the queue
// (Peek operation)
int peek(struct Queue* q)
{
    if (isEmpty(q) == 1) {
        return -1; // return some default value or handle
                   // error differently
    }
    return q->items[q->front];
}

// Function to print the current queue
void printQueue(struct Queue* q)
{
    if (q->front == -1) {
        return;
    }
    printf("**************READY QUEUE******************\n");
    printf("Queue contents:[ ");
    int i = q->front;
    while (1) {
        printf("%d --> ", q->items[i]);
        if (i == q->rear)
            break;
        i = (i + 1) % 3;
    }
    printf("]\n");
    printf("********************************************\n\n\n");

}


// Define PriorityQueue structure
struct PriorityQueue {
    int items[3];
    int size;
};

// Define swap function to swap two integers
void swap(int* a, int* b)
{
    int temp = *a;
    *a = *b;
    *b = temp;
}

// Define heapifyUp function to maintain heap property
// during insertion
void heapifyUp(struct PriorityQueue* pq, int index)
{
    if (index
        && pq->items[(index - 1) / 2] > pq->items[index]) {
        swap(&pq->items[(index - 1) / 2],
             &pq->items[index]);
        heapifyUp(pq, (index - 1) / 2);
    }
}

// Define enqueue function to add an item to the queue
void enqueuePQ(struct PriorityQueue* pq, int value)
{
    if (pq->size == 3) {
        printf("Priority queue is full\n");
        return;
    }

    pq->items[pq->size++] = value;
    heapifyUp(pq, pq->size - 1);
}

// Define heapifyDown function to maintain heap property
// during deletion
void heapifyDown(struct PriorityQueue* pq, int index)
{
    int smallest = index;
    int left = 2 * index + 1;
    int right = 2 * index + 2;

    if (left < pq->size
        && pq->items[left] < pq->items[smallest])
        smallest = left;

    if (right < pq->size
        && pq->items[right] < pq->items[smallest])
        smallest = right;

    if (smallest != index) {
        swap(&pq->items[index], &pq->items[smallest]);
        heapifyDown(pq, smallest);
    }
}

// Define dequeue function to remove an item from the queue
int dequeuePQ(struct PriorityQueue* pq)
{
    if (!pq->size) {
        return -1;
    }

    int item = pq->items[0];
    pq->items[0] = pq->items[--pq->size];
    heapifyDown(pq, 0);
    return item;
}

// Define peek function to get the top item from the queue
int peekPQ(struct PriorityQueue* pq)
{
    if (!pq->size) {
        return -1;
    }
    return pq->items[0];
}


struct Queue qs[4];
int quantumLefts[3];






// ------ END OF QUEUES AND SCHEDULERS ------------
struct Process memory[3];

//INITIALIZE BLOCKED QUEUES/ QUEUES
struct PriorityQueue blockedFileQ;
struct PriorityQueue blockedInputQ;
struct PriorityQueue blockedOutputQ;
struct PriorityQueue blockedGeneralQ;
struct Queue readyQ;




struct Line {
    char operation[20];
    char op1[100];
    char op2[100];
};

void trim(char *str) {
    char *start = str;
    char *end;

    // Move start forward past leading whitespace
    while (isspace((unsigned char)*start)) {
        start++;
    }
 
    // If the string is all spaces
    if (*start == 0) {
        str[0] = '\0';
        return;
    }

    // Move end to the last non-whitespace character
    end = start + strlen(start) - 1;
    while (end > start && isspace((unsigned char)*end)) {
        end--;
    }

    // Null-terminate the trimmed string
    *(end + 1) = '\0';

    // Move the trimmed string to the beginning
    memmove(str, start, end - start + 2); // +1 for '\0', +1 for offset
    char *src = str, *dst = str;
    while (*src) {
        if (*src != '\n') {
            *dst++ = *src;
        }
        src++;
    }
    *dst = '\0';  // null-terminate the result
}

char* getVariableValue(const char* key, char vars[3][50]) {
    size_t key_len = strlen(key);
    for (int i = 0; i < 3; i++) {
        // Calculate expected total prefix length: key + " : "
        size_t prefix_len = key_len + 3;

        // Check if the string starts with "key : "
        if (strncmp(vars[i], key, key_len) == 0 &&
            strncmp(vars[i] + key_len, " : ", 3) == 0) {

            // Value starts after " : "
            const char* value = vars[i] + prefix_len;

            // Return a copy of the value
            char* result = malloc(strlen(value) + 1);
            if (result) strcpy(result, value);
            return result;
        }
    }
    return NULL; // not found
}

int countLines(char program[12][100]){
    int count = 0;
    int i=0;
    while (strcmp(program[i],"end")!=0) {
        count++;
        i++;    
    }
    return count;
}

void func1(int first, int last)
{
    for (char i = first; i <= last; i++)
    {
        printf("%d ", i);
    }
    printf("\n");
}

void func2(char *filename, char *data) {
    FILE *fptr = fopen(filename, "w"); // Create or overwrite
    if (fptr == NULL) {
        printf("Error creating file: %s\n", filename);
        return;
    }

    fputs(data, fptr);
    fclose(fptr);
}

void func3(char* fname){
    fptr = fopen(fname, "r");

    if (fptr)
    {
        char myString[100];
        while(fgets(myString, 100, fptr)) {
            printf("%s\n", myString);
        }

        fclose(fptr);
    } 
}

char* func3ThatReturnsInsteadOfPrints(char* fname){
    FILE* fptr = fopen(fname, "r");

    if (fptr) {
        char myString[100];
        char* result = malloc(1);  // Start with 1 byte for the null terminator
        result[0] = '\0'; // Empty string to start with
        size_t totalLen = 0;

        while (fgets(myString, 100, fptr)) {
            size_t len = strlen(myString);
            totalLen += len;
            result = realloc(result, totalLen + 1); // +1 for null terminator
            strcat(result, myString);
        }

        fclose(fptr);
        return result;
    }

    return NULL;
}

void readProgram(const char *filename, char program[12][100]) {

    fptr = fopen(filename, "r");
        if (fptr == NULL)
    {
      printf("ERROR FILE NOT FOUND");
    } else {
    
      //Store the content of the file
    char myString[100];
    int i=0;
    // Read the content and print it
    while(fgets(myString, 100, fptr)) {
        if (strlen(myString) > 4){
            sprintf(program[i],"%s",myString);
            i++;
        }
    }
    sprintf(program[i],"end");
    
    // Close the file
    fclose(fptr);
    }
}

void storeProgram(char program[12][100]){
    struct Process p;
    int programSize = 9 + countLines(program);
    p.pid = id;
    sprintf(p.state, "Ready");
    p.priority = 1;
    p.pc = 0;
    p.lowerBound = lastWord;
    p.upperBound = lastWord + programSize - 1;
    codeCounts[id] = countLines(program);
    varCounts[id] = 0;
    
    int i;
    for (i = 0; i < countLines(program); i++){
        sprintf(p.code[i], "%s", program[i]);
        trim(p.code[i]);
    }
    while( i < 11){
        strcpy(p.code[i], "");
        i++;
    }
    lastWord = lastWord + 6 + countLines(program);
    sprintf(p.vars[0], "var1 : ");
    sprintf(p.vars[1], "var2 : ");
    sprintf(p.vars[2], "var3 : ");
    memory[id] = p;
    lastWord = lastWord + 3;
    id++;
}



struct Line parse(char line[100]){
    struct Line l;
    int i = 0, j = 0;
    int word_index = 0;
    int len = strlen(line);

    char current_word[100];
    int op2_started = 0;

    // Clear the struct fields
    l.operation[0] = '\0';
    l.op1[0] = '\0';
    l.op2[0] = '\0';

    while (i < len) {
        if (line[i] == ' ') {
            if (j > 0) {
                current_word[j] = '\0';

                if (word_index == 0) {
                    sprintf(l.operation, "%s", current_word);
                } else if (word_index == 1) {
                    sprintf(l.op1, "%s", current_word);
                }
                word_index++;
                j = 0;
            }
            // If we've reached the third word, start copying directly to op2
            if (word_index >= 2) {
                int len_op2 = strlen(l.op2);
                l.op2[len_op2] = line[i];
                l.op2[len_op2 + 1] = '\0';
            }
        } else {
            if (word_index < 2) {
                current_word[j++] = line[i];
            } else {
                // Directly append to op2
                int len_op2 = strlen(l.op2);
                l.op2[len_op2] = line[i];
                l.op2[len_op2 + 1] = '\0';
            }
        }
        i++;
    }

    // Handle case where input ends after two words
    if (j > 0 && word_index < 2) {
        current_word[j] = '\0';
        if (word_index == 0) {
            sprintf(l.operation, "%s", current_word);
        } else if (word_index == 1) {
            sprintf(l.op1, "%s", current_word);
        }
    }

    trim(l.operation);
    trim(l.op1);
    trim(l.op2);

    return l;
}



void execute(char line[100], struct Process *p){
    struct Line l = parse(line);
    
    if (strcmp(l.operation, "print") == 0){
        printf("%s\n", getVariableValue(l.op1, p->vars));
        return;
    }

    if (strcmp(l.operation, "printFromTo") == 0){
        func1(atoi(getVariableValue(l.op1, p->vars)), atoi(getVariableValue(l.op2, p->vars)));
        return;
    }

    if (strcmp(l.operation, "writeFile") == 0){
        if(strncmp(l.op2, "readFile ", 9) == 0) {
            struct Line nestedLine = parse(l.op2);
            sprintf(l.op2 , "%s", func3ThatReturnsInsteadOfPrints(getVariableValue(nestedLine.op1, p->vars)));
        }
        func2(getVariableValue(l.op1, p->vars), getVariableValue(l.op2, p->vars));
        return;
    }

    if (strcmp(l.operation, "readFile") == 0){
        func3(getVariableValue(l.op1, p->vars));
        return;
    }

    
    if (strcmp(l.operation, "assign") == 0){
        char input[100];
        sprintf(input, "%s", l.op2);
        if(strncmp(l.op2, "readFile ", 9) == 0) {
            struct Line nestedLine = parse(l.op2);
            sprintf(input , "%s", func3ThatReturnsInsteadOfPrints(getVariableValue(nestedLine.op1, p->vars)));
        }
        if (strcmp(l.op2, "input") == 0){
            printf("Please enter a value\n");
            fflush(stdout);
            scanf("%s", input);
        }
        
        char seperator[] = " : ";
        trim(input);
        sprintf(memory[p->pid].vars[varCounts[p->pid]], "%s",  strcat(strcat(l.op1, seperator), input));
        varCounts[p->pid]++;
        return;
    }

    if (strcmp(l.operation, "semWait") == 0){
        if(strcmp(l.op1, "userInput") == 0)
        {
            if(userInputLock == 0)
            {
                printf("Process (%d) acquired user input \n", p->pid );
                userInputLock = 1;

            } else {
                //place in blocked queue for userInput
                printf("Process (%d) was blocked for user input \n", p->pid );
                if(sched_code == 0|| sched_code == 1)
                {
                   
                    int peeked_id =   dequeue(&readyQ);
                    quantumLeft = quantum;
                    printf("Removed Process (%d) from the ready queue \n", peeked_id);
                    // printf(" next in line for execution: (%d)\n \n", peek(&readyQ));

                } else {
                    int lvl = 0;
                    while(isEmpty(&qs[lvl]) == 1){
                        lvl++;
                    } 
                    dequeue(&qs[lvl]);
                    quantumLefts[p->pid] = pow(2, p->priority -1);

                }
               
                enqueuePQ(&blockedInputQ, p->pid);
                enqueuePQ(&blockedGeneralQ, p->pid);
                strcpy(memory[p->pid].state, "Blocked");

            }  
        }

        if(strcmp(l.op1, "userOutput") == 0)
        {
            if(userOutputLock == 0)
            {
                printf("Process (%d) acquired user output \n", p->pid );
                userOutputLock = 1;
            } else {
                //place in blocked queue for userOutput
                printf("Process (%d) was blocked for user output \n", p->pid );
                if(sched_code == 0 || sched_code == 1)
                {
                    dequeue(&readyQ);
                    quantumLeft = quantum;


                } else {
                    int lvl = 0;
                    while(isEmpty(&qs[lvl]) == 1){
                        lvl++;
                    } 
                    dequeue(&qs[lvl]);
                    quantumLefts[p->pid] = pow(2, p->priority -1);

                }
               
               
                enqueuePQ(&blockedOutputQ, p->pid);
                enqueuePQ(&blockedGeneralQ, p->pid);
                strcpy(memory[p->pid].state, "Blocked");


            }
            
        }


        if(strcmp(l.op1, "file") == 0)
        {
            if(fileLock == 0)
            {
                printf("Process (%d) acquired file access \n", p->pid );
                fileLock = 1;
            } else {
                //place in blocked queue for file
                printf("Process (%d) was blocked for file access \n", p->pid );

                if(sched_code == 0 || sched_code == 1)
                {
                    dequeue(&readyQ);
                    quantumLeft = quantum;


                } else {
                    int lvl = 0;
                    while(isEmpty(&qs[lvl]) == 1){
                        lvl++;
                    } 
                    dequeue(&qs[lvl]);
                    quantumLefts[p->pid] = pow(2, p->priority -1);

                    
                }
               
                enqueuePQ(&blockedFileQ, p->pid);
                enqueuePQ(&blockedGeneralQ, p->pid);
                strcpy(memory[p->pid].state, "Blocked");

            }
            
        }
        return;
    }

    if (strcmp(l.operation, "semSignal") == 0){
         if(strcmp(l.op1, "userInput") == 0)
        {
            userInputLock = 0; 
            printf("Process (%d) released user input \n", p->pid );
            //remove first guy from blocked queue
            int unblocked_id = dequeuePQ(&blockedInputQ);
        
            if(unblocked_id == -1) return; //do not continue if blockedqueue is empty
            printf("Process (%d) acquired user input \n", unblocked_id );
            strcpy(memory[unblocked_id].state, "Ready");

            if(sched_code == 0 || sched_code == 1)
                {
                  enqueue(&readyQ, unblocked_id);

                } else {
                    
                    enqueue(&qs[memory[unblocked_id].priority -1], unblocked_id);
                }
               
            
        }

        if(strcmp(l.op1, "userOutput") == 0)
        {
            userOutputLock = 0; 
             //remove first guy from blocked queue
             printf("Process (%d) released user output \n", p->pid );
             int unblocked_id = dequeuePQ(&blockedOutputQ);
             if(unblocked_id == -1) return; //do not continue if blockedqueue is empty
             printf("Process (%d) acquired user output \n", unblocked_id );

             strcpy(memory[unblocked_id].state, "Ready");
             if(sched_code == 0 || sched_code == 1)
                {
                  enqueue(&readyQ, unblocked_id);

                } else {
                    
                    enqueue(&qs[memory[unblocked_id].priority -1], unblocked_id);
                }
        }


        if(strcmp(l.op1, "file") == 0)
        {
            fileLock = 0; 
            //remove first guy from blocked queue
            printf("Process (%d) released file access \n", p->pid );
            int unblocked_id = dequeuePQ(&blockedFileQ);
            if(unblocked_id == -1) return; //do not continue if blockedqueue is empty
            printf("Process (%d) acquired file access \n", unblocked_id );
            strcpy(memory[unblocked_id].state, "Ready");
            if(sched_code == 0 || sched_code == 1)
                {
                  enqueue(&readyQ, unblocked_id);

                } else {
                    
                    enqueue(&qs[memory[unblocked_id].priority -1], unblocked_id);
                }
        }
        return;
    }
}


void executeNextLine(int id){
    if (memory[id].pc < codeCounts[id]){
        // int line = memory[id].lowerBound + 6 + memory[id].pc;
        // printf("Process (%d) is executing this line (%s) \n", id,memory[id].code[memory[id].pc]);
        execute(memory[id].code[memory[id].pc], &memory[id]);
        memory[id].pc++;
    }
    else{
        if(id != -1)
        {
            printf("PROCESS (%d) FINISHED EXECUTION !!!\n", id);
        }
        
        // idk what to do when finish
    }
}

int FIFO_time()
{
    int curr_id = peek(&readyQ);
    if(memory[curr_id].pc >= codeCounts[curr_id])
    {
        // process done
        if(isEmpty(&readyQ) == 0)
        {
            dequeue(&readyQ);
            return -1;
        }
        
        return  peek(&readyQ);
    }
    return curr_id;
   
}

int RR_time()
{

    int curr_id = peek(&readyQ);
    if(memory[curr_id].pc >= codeCounts[curr_id])
    {
        //process done
        
        dequeue(&readyQ);
        quantumLeft = quantum -1;
        return peek(&readyQ);
    }

    if(quantumLeft == 0)
    {
        dequeue(&readyQ);
        enqueue(&readyQ, curr_id);
        quantumLeft = quantum -1;
        return peek(&readyQ);
    }

    quantumLeft--;
    return curr_id;
}


int isMLFQFull(){
    for(int i = 0; i < 4; i++)
    {
        if(isEmpty(&qs[i]) == 0)
        {
            return 1;
        }
    }
    return 0;
}

int MLFQ_time()
{
    int curr_id;
    int lvl = 0;
    while(isEmpty(&qs[lvl]) == 1){
        lvl++;
    } 
    curr_id = peek(&(qs[lvl]));
    if(memory[curr_id].pc >= codeCounts[curr_id])
    {
        //process done
        dequeue(&qs[lvl]);
        return curr_id;
    }
    
    if(quantumLefts[curr_id] == 0)
    {
        dequeue(&qs[lvl]);
        enqueue(&qs[(lvl+1  > 3 )? lvl: lvl+1], curr_id);
        memory[curr_id].priority > 3 ? 4 : memory[curr_id].priority++;
        quantumLefts[curr_id] = (int) pow(2, (lvl+1  > 3)? lvl: lvl+1);
        while(isEmpty(&qs[lvl]) == 1){
            lvl++;
        } 
        quantumLefts[peek(&qs[lvl])]--;
        return peek(&qs[lvl]);
    }

    quantumLefts[curr_id]--;
    return curr_id;
}

int notEmptyReadyQ(){
    return (isEmpty(&readyQ) == 1 ? 0 : 1);
}

static void print_queue(FILE *f, const char *name, struct Queue *q) {
    fprintf(f, "  \"%s\": [", name);
    if (q->front != -1) {
        int i = q->front;
        while (1) {
            fprintf(f, "%d", q->items[i]);
            if (i == q->rear) break;
            fprintf(f, ", ");
            i = (i + 1) % 3;
        }
    }
    fprintf(f, "]");
}

// Print only active elements in the priority queue, based on size
static void print_prioq(FILE *f, const char *name, struct PriorityQueue *q) {
    fprintf(f, "  \"%s\": [", name);
    for (int i = 0; i < q->size; ++i) {
        fprintf(f, "%d", q->items[i]);
        if (i < q->size - 1) fprintf(f, ", ");
    }
    fprintf(f, "]");
}

void dump_state_to_json(const char *filename) {
    FILE *f = fopen(filename, "w");
    if (!f) {
        perror("Failed to open file");
        return;
    }
    fprintf(f, "{\n");
    // primitive values
    fprintf(f, "  \"id\": %d,\n", id);
    fprintf(f, "  \"userInputLock\": %d,\n", userInputLock);
    fprintf(f, "  \"fileLock\": %d,\n", fileLock);
    fprintf(f, "  \"userOutputLock\": %d,\n", userOutputLock);
    fprintf(f, "  \"quantum\": %d,\n", quantum);
    fprintf(f, "  \"sched_code\": %d,\n", sched_code);

    // queues
    

    // qs array
    fprintf(f, "  \"qs\": {\n");
    for (int i = 0; i < 4; ++i) {
        char buffer[50]; // Allocate enough space
        sprintf(buffer, "level%d", i+1);
        print_queue(f, buffer, &qs[i]);
        if (i < 3) fprintf(f, ",\n"); else fprintf(f, "\n");
    }
    fprintf(f, "  },\n");

    // quantumLefts
    fprintf(f, "  \"quantumLefts\": [%d, %d, %d],\n",
            quantumLefts[0], quantumLefts[1], quantumLefts[2]);

    // memory array of processes
    fprintf(f, "  \"memory\": [\n");
    for (int i = 0; i < 3; ++i) {
        struct Process *p = &memory[i];
        fprintf(f, "    {\n");
        fprintf(f, "      \"pid\": %d,\n", p->pid);
        fprintf(f, "      \"state\": \"%s\",\n", p->state);
        fprintf(f, "      \"priority\": %d,\n", p->priority);
        fprintf(f, "      \"pc\": %d,\n", p->pc);
        fprintf(f, "      \"lowerBound\": %d,\n", p->lowerBound);
        fprintf(f, "      \"upperBound\": %d,\n", p->upperBound);
        // code lines
        fprintf(f, "      \"code\": [");
        for (int j = 0; j < 11; ++j) {
            // char trimmed[100]; // make sure it's big enough

            // size_t len = strlen(p->code[j]);
            // if (len > 0) {
            //     strncpy(trimmed, p->code[j], len - 1); // copy all but last char
            //     trimmed[len - 1] = '\0';             // manually null-terminate
            // }
            fprintf(f, "\"%s\"", p->code[j]);
            if (j < 10) fprintf(f, ", ");
        }
        fprintf(f, "],\n");
        // vars
        fprintf(f, "      \"vars\": [");
        for (int j = 0; j < 3; ++j) {
            fprintf(f, "\"%s\"", p->vars[j]);
            if (j < 2) fprintf(f, ", ");
        }
        fprintf(f, "]\n    }");
        if (i < 2) fprintf(f, ",\n"); else fprintf(f, "\n");
    }
    fprintf(f, "  ],\n");

    // blocked priority queues
    print_prioq(f, "blockedFileQ", &blockedFileQ); fprintf(f, ",\n");
    print_prioq(f, "blockedInputQ", &blockedInputQ); fprintf(f, ",\n");
    print_prioq(f, "blockedOutputQ", &blockedOutputQ); fprintf(f, ",\n");
    print_prioq(f, "blockedGeneralQ", &blockedGeneralQ); fprintf(f, ",\n");

    // readyQ
    print_queue(f, "readyQ", &readyQ); fprintf(f, ",\n");

    // clock
    fprintf(f, "  \"clock\": %d\n", clock);
    fprintf(f, "}\n");

    fclose(f);
}




int main(int argc, char *argv[]) {
    // Check if enough arguments are provided
    if (argc != 9) {
        printf("Usage: %s <sched_code> <arrival1> <arrival2> <arrival3> <quantum> <path1> <path2> <path3>\n", argv[0]);
        return 1; // Return with error code
    }
    char program1 [12][100];
    char program2 [12][100];
    char program3 [12][100];

    // Parse arguments from the command line
    sched_code = atoi(argv[1]);   // Convert the argument to int
    int arrival1 = atoi(argv[2]);
    int arrival2 = atoi(argv[3]);
    int arrival3 = atoi(argv[4]);
    quantum = atoi(argv[5]);
    readProgram(argv[6], program1);
    readProgram(argv[7], program2);
    readProgram(argv[8], program3);

    int (*schedulers[])() = { FIFO_time, RR_time, MLFQ_time };
    int (*notDone[])() = { notEmptyReadyQ, notEmptyReadyQ, isMLFQFull };



    quantumLeft = quantum;
    initializeQueue(&readyQ);
    initializeQueue(&qs[0]);
    initializeQueue(&qs[1]);
    initializeQueue(&qs[2]);
    initializeQueue(&qs[3]);
    

    
    
    

    for(int i = 0; i < 3; i++)
    {
        quantumLefts[i] = 1;
    }
    int maxArrival = 0;

    maxArrival = (arrival1 >= arrival2) 
             ? ((arrival1 >= arrival3) ? arrival1 : arrival3)
             : ((arrival2 >= arrival3) ? arrival2 : arrival3);
             

    int x = 1;
    while(notDone[sched_code]() == 1 || clock <= maxArrival)
    {   if(x == 2)
        {
            return 0;
        }
        

        if(clock == arrival1){
            printf("Process (%d) arrived!\n", id);
            enqueue(&qs[0], id);
            enqueue(&readyQ, id);
            storeProgram(program1);
    
    
        }
        if(clock == arrival2){
            printf("Process (%d) arrived!\n", id);
            enqueue(&qs[0], id);
            enqueue(&readyQ, id);
            storeProgram(program2);
        }
        if(clock == arrival3){
            printf("Process (%d) arrived!\n", id);
            enqueue(&qs[0], id);
            enqueue(&readyQ, id);
            storeProgram(program3);
        }
        // printQueue(&readyQ);
        // printf("Q state: %d \n",isEmpty(&readyQ));
        // printf("Code counts 2:  %d \n", codeCounts[0]);
        // dump_state_to_json("dumpster.txt");
        // printf("sched code: %d \n", sched_code);
        executeNextLine(schedulers[sched_code]());
        dump_state_to_json("dumpster.txt");
        fflush(stdout);
        while(!scanf("%d", &x));
        clock++;
        
        // printf("2's pc:%d \n", memory[0].pc);
    }
    

    
    // for (int i = 0; i < 3; i++) {
    //     struct Process p = memory[i];
    //     printf("----- Process Information -----\n");
    //     printf("PID: %d\n", p.pid);
    //     printf("State: %s\n", p.state);
    //     printf("Priority: %d\n", p.priority);
    //     printf("Program Counter (PC): %d\n", p.pc);
    //     printf("Memory Bounds: [%d - %d]\n", p.lowerBound, p.upperBound);
        
    //     printf("\nVariables (%d):\n", varCounts[p.pid]);
    //     for (int i = 0; i < varCounts[p.pid]; i++) {
    //         printf("  Var[%d]: %s\n", i, p.vars[i]);
    //     }

    //     printf("\nCode (%d lines):\n", codeCounts[p.pid]);
    //     for (int i = 0; i < codeCounts[p.pid]; i++) {
    //         printf("  [%d]: %s\n", i, p.code[i]);
    //     }
    //     printf("--------------------------------\n");
    // }


    return 0;
    

}
