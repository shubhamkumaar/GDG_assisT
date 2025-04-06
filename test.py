import xmltodict
import json
def xml_to_json(xml:str)->str:
    doc = xmltodict.parse(xml)

    # ugly code ahead
    def cleanup_feedback_dict(data):
        result = data.copy()
        
        # convert max_score and score to integers
        if 'max_score' in result['feedback']:
            result['feedback']['max_score'] = int(float(result['feedback']['max_score']))
        if 'score' in result['feedback']:
            result['feedback']['score'] =  int(float(result['feedback']['score']))


        print(json.dumps(result, indent=4))

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

    cleaned_data = cleanup_feedback_dict(doc)
    return cleaned_data

xml ="""<feedback>
  <score>3</score>
  <max_score>10</max_score>
  <summary_bullets>
    <bullet>You have a solid foundational understanding of the HDFS component within Hadoop, particularly its architecture and the roles of NameNode and DataNodes.</bullet>
    <bullet>Your answer significantly lacks coverage of YARN and MapReduce, which are crucial core components for resource management and data processing in Hadoop, indicating a gap in understanding the broader Hadoop ecosystem.</bullet>
    <bullet>To improve your understanding of Hadoop architecture, prioritize learning about YARN's resource management functionalities and the MapReduce programming model and workflow.</bullet>
    <bullet>Focus on studying the interactions and dependencies between HDFS, YARN, and MapReduce to gain a comprehensive understanding of the Hadoop framework.</bullet>
  </summary_bullets>
  <detailed_feedback>
    <question>
      <question_id>Q1</question_id>
      <grading_analysis>
        <category name="Understanding of Hadoop Core Components">1/3</category>
        <category name="HDFS Architecture and Functionality">2/2</category>
        <category name="YARN Architecture and Resource Management">0/2</category>
        <category name="MapReduce Workflow and Programming Model">0/3</category>
        <category name="Overall Clarity and Detail">N/A</category>
      </grading_analysis>
      <score_summary>
        <rubric_score>3/10</rubric_score>
        <final_score>3/10</final_score>
      </score_summary>
      <feedback>
        Your description of the Hadoop Distributed File System (HDFS) is accurate and covers the key components like NameNode and DataNodes, as well as important features like replication and scalability. You correctly pointed out the master-slave architecture of HDFS.
        However, your answer is incomplete as it primarily focuses on HDFS and misses two other critical components of Hadoop architecture: YARN and MapReduce. To improve, you need to expand your answer to include detailed explanations of both YARN (for resource management) and MapReduce (for data processing).
        For YARN, describe its components like ResourceManager, NodeManager, and ApplicationMaster, and explain how it manages cluster resources and schedules applications. For MapReduce, detail the Map, Shuffle, Sort, and Reduce phases, and explain how it enables parallel data processing.  Understanding how these three components work together is essential for grasping the overall Hadoop architecture.
      </feedback>
      <strengths>
        <strength>&quot;Hadoop distributed file system (HDFS) follows a master-slave architecture... Name node (Master): Manages metadata... Data Nodes (Slaves): They store actual data blocks&quot;. This clearly and correctly identifies the fundamental architecture of HDFS and the roles of its primary components.</strength>
        <strength>&quot;Replication: Default replication factor is 3; ensuring fault tolerance by storing copies across multiple nodes.&quot; This accurately highlights a key feature of HDFS and explains its importance for data reliability in a distributed environment.</strength>
      </strengths>
      <areas_of_improvement>
        <improvement>Your answer is significantly lacking in the discussion of **YARN (Yet Another Resource Negotiator)**.  To improve, you should describe YARN's role in resource management and application scheduling within Hadoop. Explain how ResourceManager, NodeManager, and ApplicationMaster contribute to this process. Understanding YARN is crucial as it's responsible for managing cluster resources for all applications, including MapReduce.</improvement>
        <improvement>The answer is also completely missing a discussion of **MapReduce**.  This is a core component for data processing in Hadoop. You need to detail the MapReduce programming model and its workflow, including the Map, Shuffle and Sort, and Reduce phases. Explain how MapReduce enables parallel processing of large datasets across the Hadoop cluster.</improvement>
      </areas_of_improvement>
      <targeted_resources>
        <resource>Apache Hadoop Official Documentation: Refer to the official Hadoop documentation, specifically the sections on Hadoop Architecture, HDFS, YARN, and MapReduce. This will provide comprehensive and accurate information about each component. [https://hadoop.apache.org/docs/stable/](https://hadoop.apache.org/docs/stable/)</resource>
        <resource>&quot;Hadoop: The Definitive Guide&quot; by Tom White: This book is a highly recommended resource for in-depth understanding of Hadoop and its components. Chapters on Hadoop Architecture, HDFS, YARN, and MapReduce will be particularly relevant.</resource>
        <resource>Online Tutorials on YARN and MapReduce: Search for online tutorials or video explanations on platforms like YouTube or Coursera focusing specifically on &quot;Hadoop YARN architecture&quot; and &quot;Hadoop MapReduce workflow.&quot; Visual and step-by-step explanations can be very helpful in understanding these concepts.</resource>
      </targeted_resources>
    </question>
    <question>
      <question_id>Q1</question_id>
      <grading_analysis>
        <category name="Understanding of Hadoop Core Components">1/3</category>
        <category name="HDFS Architecture and Functionality">2/2</category>
        <category name="YARN Architecture and Resource Management">0/2</category>
        <category name="MapReduce Workflow and Programming Model">0/3</category>
        <category name="Overall Clarity and Detail">N/A</category>
      </grading_analysis>
      <score_summary>
        <rubric_score>3/10</rubric_score>
        <final_score>3/10</final_score>
      </score_summary>
      <feedback>
        Your description of the Hadoop Distributed File System (HDFS) is accurate and covers the key components like NameNode and DataNodes, as well as important features like replication and scalability. You correctly pointed out the master-slave architecture of HDFS.
        However, your answer is incomplete as it primarily focuses on HDFS and misses two other critical components of Hadoop architecture: YARN and MapReduce. To improve, you need to expand your answer to include detailed explanations of both YARN (for resource management) and MapReduce (for data processing).
        For YARN, describe its components like ResourceManager, NodeManager, and ApplicationMaster, and explain how it manages cluster resources and schedules applications. For MapReduce, detail the Map, Shuffle, Sort, and Reduce phases, and explain how it enables parallel data processing.  Understanding how these three components work together is essential for grasping the overall Hadoop architecture.
      </feedback>
      <strengths>
        <strength>&quot;Hadoop distributed file system (HDFS) follows a master-slave architecture... Name node (Master): Manages metadata... Data Nodes (Slaves): They store actual data blocks&quot;. This clearly and correctly identifies the fundamental architecture of HDFS and the roles of its primary components.</strength>
        <strength>&quot;Replication: Default replication factor is 3; ensuring fault tolerance by storing copies across multiple nodes.&quot; This accurately highlights a key feature of HDFS and explains its importance for data reliability in a distributed environment.</strength>
      </strengths>
      <areas_of_improvement>
        <improvement>Your answer is significantly lacking in the discussion of **YARN (Yet Another Resource Negotiator)**.  To improve, you should describe YARN's role in resource management and application scheduling within Hadoop. Explain how ResourceManager, NodeManager, and ApplicationMaster contribute to this process. Understanding YARN is crucial as it's responsible for managing cluster resources for all applications, including MapReduce.</improvement>
        <improvement>The answer is also completely missing a discussion of **MapReduce**.  This is a core component for data processing in Hadoop. You need to detail the MapReduce programming model and its workflow, including the Map, Shuffle and Sort, and Reduce phases. Explain how MapReduce enables parallel processing of large datasets across the Hadoop cluster.</improvement>
      </areas_of_improvement>
      <targeted_resources>
        <resource>Apache Hadoop Official Documentation: Refer to the official Hadoop documentation, specifically the sections on Hadoop Architecture, HDFS, YARN, and MapReduce. This will provide comprehensive and accurate information about each component. [https://hadoop.apache.org/docs/stable/](https://hadoop.apache.org/docs/stable/)</resource>
        <resource>&quot;Hadoop: The Definitive Guide&quot; by Tom White: This book is a highly recommended resource for in-depth understanding of Hadoop and its components. Chapters on Hadoop Architecture, HDFS, YARN, and MapReduce will be particularly relevant.</resource>
        <resource>Online Tutorials on YARN and MapReduce: Search for online tutorials or video explanations on platforms like YouTube or Coursera focusing specifically on &quot;Hadoop YARN architecture&quot; and &quot;Hadoop MapReduce workflow.&quot; Visual and step-by-step explanations can be very helpful in understanding these concepts.</resource>
      </targeted_resources>
    </question>
  </detailed_feedback>
</feedback>
"""

json_data = xml_to_json(xml)
print(json.dumps(json_data, indent=4))
