# -*- coding: utf-8 -*-
import nltk
import random
from random import shuffle
from nltk.corpus import wordnet as wn
from nltk.stem.lancaster import LancasterStemmer
from collections import defaultdict

import pprint
import time
import re

import sys
import json



def remove_non_ascii_1(text):
    return ''.join([i if ord(i) < 128 else ' ' for i in text])

def remove_non_ascii_2(text):
    return re.sub(r'[^\x00-\x7F]+',' ', text)


def frequentMostCommon(text_word) :
    cfd = nltk.FreqDist(text_word)

    mostcommonlist = ""

    for word in cfd.most_common(100):
        mostcommonlist = mostcommonlist + word[0] + " "



    tagged = nltk.pos_tag(nltk.word_tokenize(mostcommonlist))

    #print tagged
    vb = []
    nn = []
    nnp = []
    for word, type in tagged:
        if type == "NNS" or type == "NN":
            nn.append(word)
            #print word
        if type == "NNP":
            nnp.append(word)
            #print word
        if type == "VB"  or type == "VBD" or type == "VBS" or type == "VBP" or type == "VBG" or type == "VBN":
            vb.append(word)
            #print word
    return nn, nnp, vb, tagged

# Find potential other cause and effect keywords
def qCauseEffect(sent):
    effect = sent.split("because", 1)
    #print effect

# Identify subject and use most common subject?
def qMainIdea(words):
    question = "What or who is the main subject of the article?"
    answer = words[0]
    random.shuffle(words)
    a = words[0]
    b = words[1]
    c = words[2]

    if a == answer:
       a = words[3]
    if b == answer:
       b = words[3]
    if c == answer:
       c = words[3]

    return question, answer, a, b, c

# Use a context aware part of speech?
def qPartOfSpeech(sent, word):
    index = sent.index(word)
    question = "What part of speech is \"" + word + "\" in the following sentence:\n" + sent
    tags = nltk.pos_tag(sent)
    answer = tags[index][1]
    a = "Noun"
    b = "Adjective"
    c = "Verb"
    d = "Lemon"
    return question, answer, a, b, c

# Improve lookup
def qRootOfWord(words):
    question = "What is the root of the word " + words[0]
    st = LancasterStemmer()
    answer = st.stem(words[0])
    a = words[1]
    b = words[2]
    c = words[3]
    return question, answer, a, b, c

def keyLen(item):
    return item[1]

def keyInd(item):
    return item[0]

# Improve sentence selection with minimum length, keyword search (based on subject)
def qSentenceOrdering(sents):
    sentsInd = []
    i = 0

    for i in range(0, len(sents)-1):
        sentsInd.append([i, len(sents[i]), sents[i]])
    #print len(sentsInd)
    #sortSents = sorted(sentsInd, key=keyLen, reverse=True)
    shuffle(sentsInd)
    sortSents = sentsInd
    #print sortSents
    returnSents = [sortSents[0], sortSents[1], sortSents[2], sortSents[3]]
    #print returnSents
    returnSentsProper = sorted(returnSents, key=keyInd)

    #print returnSentsProper
    quest = []
    i = 0
    for i in range(0, len(returnSentsProper)):
        quest.append([i+1, returnSentsProper[i][2]])

    #print quest
    question = "Identify the correct order for the following sentences: "
    for s in quest:
        question = question + str(s[0]) + ": " + str(s[1]) + "\n"

    random.shuffle(quest)

    answer = ""
    a = ""
    b = ""
    c = ""
    for s in quest:
        answer = answer + str(s[0]) + " "
    random.shuffle(quest)
    for s in quest:
        a = a + str(s[0]) + " "
    random.shuffle(quest)
    for s in quest:
        b = b + str(s[0]) + " "
    random.shuffle(quest)
    for s in quest:
        c = c + str(s[0]) + " "


    return question, answer, a, b, c




    #print sortSents

# Check reading level of word (syllable count)
def qHypernymNoun(word, randomWords):
    synsets = wn.synsets(word)
    if len(synsets) < 1:
        return "", "", "", "", "", 1

    hypernyms = synsets[0].hypernyms()
    if len(hypernyms) < 1:
        return "", "", "", "", "", 1

    answer = hypernyms[0].name().split('.')[0]
    question = "A(n) " + word + " is an example of a ____________."
    hyponyms = synsets[0].hyponyms()

    options = []

    for i in hyponyms:
        options.append(i.name().split('.')[0])
    for i in randomWords:
        options.append(i)

    random.shuffle(options)

    if len(options) >= 3:
        a = options[0]
        b = options[1]
        c = options[2]
        return question, answer, a, b, c, 0
    else:
        return "", "", "", "", "", 1


    selected = []
    aNotFound = 1
    bNotFound = 1
    cNotFound = 1
    n = len(hyponyms)
    #print n
    if n > 2:
        while aNotFound or bNotFound or cNotFound:
           r = random.randint(0,n-1)
           print r
           if r in selected:
               continue
           elif aNotFound:
               a = hyponyms[r].name().split('.')[0]
               selected.append(r)
               aNotFound = 0
           elif bNotFound:
               b = hyponyms[r].name().split('.')[0]
               selected.append(r)
               bNotFound = 0
           elif cNotFound:
               c = hyponyms[r].name().split('.')[0]
               selected.append(r)
               cNotFound = 0
           else:
               continue
    else:
        failed = 1
        return

    failed = 0
    return question, answer, a, b, c, failed

def qSynonymVerb(word, sentence, randomWords):
    synsets = wn.synsets(word)

    synonyms = synsets[0].lemma_names()
    #print synonyms

    lemma = synsets[0].lemmas()[0]
    if(len(synsets) < 1):
       return "", "", "", "", "", 1
    #answer = synsets[0].name().split('.')[0]
    answer = synonyms[0]
    question = "What does " + word + " mean in the following sentence?\n" + sentence
    #print lemma
    antonyms = lemma.antonyms()
    #print antonyms
    tos = synsets[0].similar_tos()
    synonyms = synsets[1:]

    options = []

    for i in antonyms:
        options.append(i.name().split('.')[0])
    for i in randomWords:
        options.append(i)

    #print options
    shuffle(options)

    if len(options) >= 3:
        a = options[0]
        b = options[1]
        c = options[2]
        return question, answer, a, b, c, 0
    else:
        return "", "", "", "", "", 1



def printQuestion(question, answer, a, b, c):
    options = [answer, a, b, c]
    random.shuffle(options)
    print json.dumps({'question': question, 'answer' : answer, 'a' : a, 'b' : b, 'c' : c} );




with open ("out.txt", "r") as myfile:
    data=myfile.read().replace('\n', '')


t = data

t = remove_non_ascii_1(t)
t = remove_non_ascii_2(t)

text_word = nltk.word_tokenize(t)
text_sent = nltk.sent_tokenize(t)

text = t




##### Key word extraction
from nltk.sem import relextract
text_word_pos = nltk.pos_tag(text_word)
text_word_chunk =  nltk.ne_chunk(text_word_pos, binary=True)


tree = text_word_chunk

pairs = relextract.tree2semi_rel(tree)


reldicts = relextract.semi_rel2reldict(pairs)

#print reldicts
#print len(reldicts)
#for r in reldicts:
    #for k, v in sorted(r.items()):
        #print(k, '=>', v)
        #print


###### From open source for finding key words


# Used when tokenizing words
sentence_re = r'''(?x)      # set flag to allow verbose regexps
      ([A-Z])(\.[A-Z])+\.?  # abbreviations, e.g. U.S.A.
    | \w+(-\w+)*            # words with optional internal hyphens
    | \$?\d+(\.\d+)?%?      # currency and percentages, e.g. $12.40, 82%
    | \.\.\.                # ellipsis
    | [][.,;"'?():-_`]      # these are separate tokens
'''

lemmatizer = nltk.WordNetLemmatizer()
stemmer = nltk.stem.porter.PorterStemmer()

#Taken from Su Nam Kim Paper...
grammar = r"""
    NBAR:
        {<NN.*|JJ>*<NN.*>}  # Nouns and Adjectives, terminated with Nouns

    NP:
        {<NBAR>}
        {<NBAR><IN><NBAR>}  # Above, connected with in/of/etc...
"""
chunker = nltk.RegexpParser(grammar)

toks = nltk.regexp_tokenize(text, sentence_re)
postoks = nltk.tag.pos_tag(toks)

#print postoks

tree = chunker.parse(postoks)
#print tree

from nltk.corpus import stopwords
stopwords = stopwords.words('english')


def leaves(tree):
    """Finds NP (nounphrase) leaf nodes of a chunk tree."""
    for subtree in tree.subtrees(filter = lambda t: t.label=='NP'):
        yield subtree.leaves()

def normalise(word):
    """Normalises words to lowercase and stems and lemmatizes it."""
    word = word.lower()
    word = stemmer.stem_word(word)
    word = lemmatizer.lemmatize(word)
    return word

def acceptable_word(word):
    """Checks conditions for acceptable word: length, stopword."""
    accepted = bool(2 <= len(word) <= 40
        and word.lower() not in stopwords)
    return accepted


def get_terms(tree):
    for leaf in leaves(tree):
        term = [ normalise(w) for w,t in leaf if acceptable_word(w) ]
        yield term

terms = get_terms(tree)

#for term in terms:
    #for word in term:
    #    print word,
    #print


nn, nnp, vb, tagged = frequentMostCommon(text_word)



#for sent in text_sent:
#    if "because" in sent:
#        qCauseEffect(sent)
uselessWords = ["he", "He", "him", "Him", "I", "i", "We", "we", "She", "she","It", "it","Her", "her", "They", "they", "Them", "them", "his", "His", "Hers", "hers", "Our", "our", "Ours", "Our", "their", "Their", "their\'s", "Their\'s"  ]

for n in nn:
    if n in uselessWords:
        nn.remove(n)

vb = sorted(vb, key=len, reverse=True)


sys.stdout = open("pyout.txt", "w")

for i in range(0,10):
    for sent in text_sent:
        if vb[i] in sent:
            question, answer, a, b, c, failed = qSynonymVerb(vb[i], sent, [vb[random.randint(1,len(vb)-1)], vb[random.randint(1,len(vb)-1)], vb[random.randint(1,len(vb)-1)]])
            if failed != 1:
                 printQuestion(question, answer, a, b, c)
            break

for i in range(0,2):
    question, answer, a, b, c = qSentenceOrdering(text_sent)
    printQuestion(question, answer, a, b, c)

for i in range(0,20):
    question, answer, a, b, c, failed = qHypernymNoun(nn[i], [nn[random.randint(1,len(nn)-1)], nn[random.randint(1,len(nn)-1)], nn[random.randint(1,len(nn)-1)]])
    if failed != 1:
        printQuestion(question, answer, a, b, c)

nnp = ["MineCraft", "Star Wars", "Guardians of the Galaxy", "Penguins"]
question, answer, a, b, c = qMainIdea(nnp)
printQuestion(question, answer, a, b, c)

combined = nn + vb
shuffle(combined)



for i in range(0,4):

    for sent in text_sent:
        if combined[i] in sent:
            question, answer, a, b, c = qPartOfSpeech(sent, combined[i])
            printQuestion(question, answer, a, b, c)
            break
#for i in range(0,4):
#    random.shuffle(combined)
#    param = [combined[0], combined[random.randint(1,len(combined)-1)], combined[random.randint(1,len(combined)-1)], combined[random.randint(1,len(combined)-1)]]
#    print param
#    question, answer, a, b, c = qRootOfWord(param)
#    printQuestion(question, answer, a, b, c)
