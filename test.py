import xmltodict
import json


with open('feedback.xml') as fd:
    doc = xmltodict.parse(fd.read())

def cleanup_feedback_dict(data):
    """
    Cleans up the feedback dictionary by:
    1. Removing redundant nesting in arrays (bullet, question, category, strength, improvement, resource)
    2. Renaming '@name' to 'category' and '#text' to 'score' in grading_analysis categories
    
    Args:
        data (dict): The original feedback dictionary
    
    Returns:
        dict: The cleaned up dictionary
    """
    result = data.copy()
    
    # Clean up summary_bullets
    if 'feedback' in result and 'summary_bullets' in result['feedback'] and result['feedback']['summary_bullets'] is not None:
        if 'bullet' in result['feedback']['summary_bullets'] and result['feedback']['summary_bullets']['bullet'] is not None:
            result['feedback']['summary_bullets'] = result['feedback']['summary_bullets']['bullet']
    
    # Clean up detailed_feedback and its nested structures
    if 'feedback' in result and 'detailed_feedback' in result['feedback'] and result['feedback']['detailed_feedback'] is not None:
        if 'question' in result['feedback']['detailed_feedback'] and result['feedback']['detailed_feedback']['question'] is not None:
            questions = result['feedback']['detailed_feedback']['question']
            result['feedback']['detailed_feedback'] = questions
            
            # Process each question
            for question in result['feedback']['detailed_feedback']:
                # Clean up grading_analysis and rename fields
                if 'grading_analysis' in question and question['grading_analysis'] is not None:
                    grading_analysis = question['grading_analysis']
                    if 'category' in grading_analysis and grading_analysis['category'] is not None:
                        categories = grading_analysis['category']
                        new_categories = []
                        for category in categories:
                            if category is not None:
                                new_category = {
                                    'category': category.get('@name'),
                                    'score': category.get('#text')
                                }
                                new_categories.append(new_category)
                        question['grading_analysis'] = new_categories
                
                # Clean up strengths
                if 'strengths' in question and question['strengths'] is not None:
                    strengths = question['strengths']
                    if 'strength' in strengths and strengths['strength'] is not None:
                        question['strengths'] = strengths['strength']
                
                # Clean up areas_of_improvement
                if 'areas_of_improvement' in question and question['areas_of_improvement'] is not None:
                    aoi = question['areas_of_improvement']
                    if 'improvement' in aoi and aoi['improvement'] is not None:
                        question['areas_of_improvement'] = aoi['improvement']
                
                # Clean up targeted_resources
                if 'targeted_resources' in question and question['targeted_resources'] is not None:
                    resources = question['targeted_resources']
                    if 'resource' in resources and resources['resource'] is not None:
                        question['targeted_resources'] = resources['resource']
    
    return result

print(json.dumps(cleanup_feedback_dict(doc), indent=4))