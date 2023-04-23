import {getUserById} from "./users.js";
import {getLocalBirds, getAllBirdsNames, getAllBirds} from "./birds.js";
import { randomizeArray } from "../helpers.js";
const getQuestionsUser = async (userId)=>{
    let userGiven =  await getUserById(userId);
    let city = userGiven["geocode"]["city"];
    let country = userGiven["geocode"]["countryCode"];
    let birdsCity,birdsCountry;
    try{
        birdsCity =await getLocalBirds(country,city);
    }catch(error){
        console.log(error);
    }
    try{
        birdsCountry =await getLocalBirds(country,"all");
    }catch(error){
        console.log(error);
    }
    
    let questionsSeen = userGiven["last_questions"];
    let names = await getAllBirdsNames();
    let questions = [];
    for( let index=0;index<birdsCity.length;index++){
        const birdid = birdsCity[index]['_id'];
        if(!questionsSeen.includes(birdid)){
            const url=birdsCity[index]['url'];
            const correct = birdsCity[index]['names'][Math.floor(Math.random()*birdsCity[index]['names'].length)];
            let options = [];
            options.push(correct);
            const difficulty = birdsCity[index]['difficulty'];
            while(true){
                const option = names[Math.floor(Math.random()*names.length)];
                if(!options.includes(option) && !birdsCity[index]['names'].includes(option)){
                    options.push(option);
                }
                if(options.length==4){
                    break;
                }
            }
            randomizeArray(options);
            let question = {
                url,correct,options,difficulty
            };
            questions.push(question);
        }
    }
    let birdsCityIds=birdsCity.map(a => a._id);
    for( let index=0;index<birdsCountry.length;index++){
        const birdid = birdsCountry[index]['_id'];
        if(!questionsSeen.includes(birdid) && !birdsCityIds.includes(birdid)){
            const url=birdsCountry[index]['url'];
            const correct = birdsCountry[index]['names'][Math.floor(Math.random()*birdsCountry[index]['names'].length)];
            let options = [];
            options.push(correct);
            const difficulty = birdsCountry[index]['difficulty'];
            while(true){
                const option = names[Math.floor(Math.random()*names.length)];
                if(!options.includes(option) && !birdsCountry[index]['names'].includes(option)){
                    options.push(option);
                }
                if(options.length==4){
                    break;
                }
            }
            randomizeArray(options);
            let question = {
                url,correct,options,difficulty
            };
            questions.push(question);
        }
    }
    if(questions.length==0){
        throw 'There are no unseen questions for the user';
    }
    randomizeArray(questions);
    return questions;
};
const getQuestionsGuest=async()=>{
    let birds,names;
    try{
        birds =await getAllBirds(country,city);
    }catch(error){
        console.log(error);
    }
    try{
    let names = await getAllBirdsNames();
    }
    catch(error){
        console.log(error);
    }
    let questions = [];
    for( let index=0;index<birds.length;index++){
        const url=birds[index]['url'];
        const correct = birds[index]['names'][Math.floor(Math.random()*birds[index]['names'].length)];
        let options = [];
        options.push(correct);
        const difficulty = birds[index]['difficulty'];
        while(true){
            const option = names[Math.floor(Math.random()*names.length)];
            if(!options.includes(option) && !birds[index]['names'].includes(option)){
                options.push(option);
            }
            if(options.length==4){
                break;
            }
        }
        randomizeArray(options);
        let question = {
            url,correct,options,difficulty
        };
        questions.push(question);
    }
    if(questions.length==0){
        throw 'There are no unseen questions for the user';
    }
    randomizeArray(questions);
    return questions;
    
};
export{
    getQuestionsUser,
    getQuestionsGuest,
};