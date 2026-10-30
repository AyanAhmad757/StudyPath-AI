import { supabase, isSupabaseConfigured } from './supabase';
import { subjectsData, richTopicContents } from '../data/mockData';

const LOCAL_SUBJECTS_KEY = 'friday_subjects_data';

export const syllabusService = {
  /**
   * Uploads syllabus document to Supabase Storage bucket 'syllabus-files'
   */
  async uploadSyllabusFile(file, userId) {
    if (!file) throw new Error('No file provided');

    // Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File size exceeds the 10 MB limit');
    }

    if (!isSupabaseConfigured() || !userId) {
      // Mock File URL fallback
      return {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileSize: file.size,
      };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userId}/${Date.now()}-${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('syllabus-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obtain private signed URL or public URL
      const { data: urlData } = supabase.storage
        .from('syllabus-files')
        .getPublicUrl(filePath);

      return {
        fileName: file.name,
        fileUrl: urlData?.publicUrl || filePath,
        fileSize: file.size,
      };
    } catch (error) {
      console.error('Error uploading syllabus file to storage:', error.message);
      // Fallback gracefully so UI flow never crashes
      return {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileSize: file.size,
      };
    }
  },

  /**
   * Create a new syllabus record in Supabase and save units/topics
   */
  async createSyllabus(syllabusData, userId) {
    if (!isSupabaseConfigured() || !userId) {
      const subjects = this.getSubjects();
      const updated = [syllabusData, ...subjects.filter((s) => s.id !== syllabusData.id)];
      this.saveSubjects(updated);
      return syllabusData;
    }

    try {
      // 1. Insert syllabus row with raw_text and metadata
      const insertPayload = {
        user_id: userId,
        title: syllabusData.name || syllabusData.title || 'Curriculum Syllabus',
        code: syllabusData.code || 'CS701',
        university: syllabusData.university || 'Engineering Curriculum',
        file_name: syllabusData.fileName,
        file_url: syllabusData.fileUrl,
        raw_text: syllabusData.rawText || syllabusData.raw_text || null,
        file_type: syllabusData.fileType || null,
        page_count: syllabusData.pageCount || null,
        word_count: syllabusData.wordCount || null,
        character_count: syllabusData.characterCount || null,
        extraction_status: 'completed',
        status: syllabusData.status || 'extracted',
      };

      const { data: syllabusRow, error: syllabusError } = await supabase
        .from('syllabi')
        .insert(insertPayload)
        .select()
        .single();

      if (syllabusError) throw syllabusError;

      // 2. Insert units and topics if provided
      if (syllabusData.units && syllabusData.units.length > 0) {
        for (const [uIdx, unit] of syllabusData.units.entries()) {
          const { data: unitRow, error: unitError } = await supabase
            .from('units')
            .insert({
              syllabus_id: syllabusRow.id,
              name: unit.title || unit.name,
              description: unit.description || '',
              order_number: unit.unitNumber || uIdx + 1,
            })
            .select()
            .single();

          if (!unitError && unit.topics && unit.topics.length > 0) {
            const topicRows = unit.topics.map((t, idx) => ({
              unit_id: unitRow.id,
              name: t.title || t.name,
              description: t.description || '',
              difficulty: t.difficulty ? t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1).toLowerCase() : 'Intermediate',
              estimated_minutes: parseInt(t.estimatedMinutes || t.estimatedTime) || 30,
              order_number: t.recommendedOrder || idx + 1,
              completed: t.completed || false,
              topic_number: t.topicNumber || `${unit.unitNumber || uIdx + 1}.${idx + 1}`,
              subtopics: Array.isArray(t.subtopics) ? t.subtopics : [],
              prerequisites: Array.isArray(t.prerequisites) ? t.prerequisites : [],
              learning_objectives: Array.isArray(t.learningObjectives) ? t.learningObjectives : [],
              recommended_order: t.recommendedOrder || idx + 1,
            }));

            await supabase.from('topics').insert(topicRows);
          }
        }
      }

      return {
        ...syllabusData,
        id: syllabusRow.id,
      };
    } catch (error) {
      console.error('Error creating syllabus in database:', error.message);
      // Fallback
      const subjects = this.getSubjects();
      const updated = [syllabusData, ...subjects.filter((s) => s.id !== syllabusData.id)];
      this.saveSubjects(updated);
      return syllabusData;
    }
  },

  /**
   * Persists structured units and topics returned by Grok AI to Supabase.
   * Atomically clears any prior placeholder units for the syllabus ID before inserting.
   */
  async saveStructuredSyllabus(syllabusId, structuredData, userId) {
    if (!structuredData || !structuredData.units) {
      throw new Error('Invalid structured syllabus data.');
    }

    const subjectMeta = structuredData.subject || {};
    const units = structuredData.units || [];

    if (!isSupabaseConfigured() || !userId || !syllabusId) {
      // Local storage fallback
      const subjects = this.getSubjects();
      let totalTopics = 0;
      const formattedUnits = units.map((u, uIdx) => {
        const uTopics = (u.topics || []).map((t, tIdx) => {
          totalTopics++;
          return {
            id: `t-${syllabusId}-${uIdx + 1}-${tIdx + 1}`,
            name: t.title || t.name,
            topicNumber: t.topicNumber || `${u.unitNumber || uIdx + 1}.${tIdx + 1}`,
            description: t.description || '',
            difficulty: t.difficulty ? t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1).toLowerCase() : 'Intermediate',
            estimatedTime: `${t.estimatedMinutes || 35} min`,
            estimatedMinutes: t.estimatedMinutes || 35,
            completed: false,
            subtopics: t.subtopics || [],
            prerequisites: t.prerequisites || [],
            learningObjectives: t.learningObjectives || [],
            recommendedOrder: t.recommendedOrder || tIdx + 1,
          };
        });

        return {
          id: `u-${syllabusId}-${uIdx + 1}`,
          unitNumber: u.unitNumber || uIdx + 1,
          title: u.title,
          description: u.description || '',
          topicsCount: uTopics.length,
          completedCount: 0,
          progress: 0,
          topics: uTopics,
        };
      });

      const updatedSubjects = subjects.map((s) => {
        if (s.id === syllabusId) {
          return {
            ...s,
            name: subjectMeta.name || s.name,
            code: subjectMeta.code || s.code,
            description: subjectMeta.description || s.description,
            unitsCount: formattedUnits.length,
            topicsCount: totalTopics,
            completedTopics: 0,
            progress: 0,
            status: 'analyzed',
            units: formattedUnits,
          };
        }
        return s;
      });

      this.saveSubjects(updatedSubjects);
      return updatedSubjects.find((s) => s.id === syllabusId);
    }

    try {
      // 1. Delete existing units/topics for this syllabus ID to prevent duplicates
      await supabase.from('units').delete().eq('syllabus_id', syllabusId);

      // 2. Update syllabus record title, code, and status
      const updatePayload = {
        status: 'analyzed',
        updated_at: new Date().toISOString(),
      };
      if (subjectMeta.name && subjectMeta.name !== 'Subject Name') {
        updatePayload.title = subjectMeta.name;
      }
      if (subjectMeta.code) {
        updatePayload.code = subjectMeta.code;
      }

      await supabase
        .from('syllabi')
        .update(updatePayload)
        .eq('id', syllabusId);

      // 3. Insert new structured units & topics
      for (const [uIdx, unit] of units.entries()) {
        const { data: unitRow, error: unitErr } = await supabase
          .from('units')
          .insert({
            syllabus_id: syllabusId,
            name: unit.title,
            description: unit.description || '',
            order_number: typeof unit.unitNumber === 'number' ? unit.unitNumber : uIdx + 1,
          })
          .select()
          .single();

        if (unitErr) throw unitErr;

        if (unit.topics && unit.topics.length > 0) {
          const topicRows = unit.topics.map((t, tIdx) => ({
            unit_id: unitRow.id,
            name: t.title || t.name,
            description: t.description || '',
            difficulty: t.difficulty ? t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1).toLowerCase() : 'Intermediate',
            estimated_minutes: parseInt(t.estimatedMinutes || t.estimatedTime) || 35,
            order_number: t.recommendedOrder || tIdx + 1,
            completed: false,
            topic_number: t.topicNumber || `${unit.unitNumber || uIdx + 1}.${tIdx + 1}`,
            subtopics: Array.isArray(t.subtopics) ? t.subtopics : [],
            prerequisites: Array.isArray(t.prerequisites) ? t.prerequisites : [],
            learning_objectives: Array.isArray(t.learningObjectives) ? t.learningObjectives : [],
            recommended_order: t.recommendedOrder || tIdx + 1,
          }));

          const { error: topicErr } = await supabase.from('topics').insert(topicRows);
          if (topicErr) throw topicErr;
        }
      }

      // 4. Return refreshed user syllabus
      const userSyllabi = await this.getUserSyllabi(userId);
      return userSyllabi.find((s) => s.id === syllabusId) || null;
    } catch (err) {
      console.error('Error saving structured syllabus to Supabase:', err.message);
      throw err;
    }
  },

  /**
   * Fetch user's syllabi from Supabase with units & topics aggregated
   */
  async getUserSyllabi(userId) {
    if (!isSupabaseConfigured() || !userId) {
      return this.getSubjects();
    }

    try {
      const { data: syllabi, error } = await supabase
        .from('syllabi')
        .select(`
          id,
          title,
          code,
          university,
          file_name,
          file_url,
          raw_text,
          status,
          created_at,
          units (
            id,
            name,
            description,
            order_number,
            topics (
              id,
              name,
              description,
              difficulty,
              estimated_minutes,
              completed,
              order_number,
              topic_number,
              subtopics,
              prerequisites,
              learning_objectives,
              recommended_order
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!syllabi || syllabi.length === 0) {
        return [];
      }

      // Map Supabase rows to consistent UI subject structure
      return syllabi.map((s) => {
        let totalTopics = 0;
        let completedTopics = 0;

        const units = (s.units || [])
          .sort((a, b) => a.order_number - b.order_number)
          .map((u) => {
            const topics = (u.topics || [])
              .sort((a, b) => (a.recommended_order || a.order_number || 0) - (b.recommended_order || b.order_number || 0))
              .map((t) => ({
                id: t.id,
                name: t.name,
                topicNumber: t.topic_number || '',
                description: t.description || '',
                difficulty: t.difficulty || 'Intermediate',
                estimatedTime: `${t.estimated_minutes || 30} min`,
                estimatedMinutes: t.estimated_minutes || 30,
                completed: Boolean(t.completed),
                subtopics: t.subtopics || [],
                prerequisites: t.prerequisites || [],
                learningObjectives: t.learning_objectives || [],
                recommendedOrder: t.recommended_order || t.order_number || 1,
              }));

            const unitCompleted = topics.filter((t) => t.completed).length;
            totalTopics += topics.length;
            completedTopics += unitCompleted;

            return {
              id: u.id,
              unitNumber: u.order_number,
              title: u.name,
              description: u.description,
              topicsCount: topics.length,
              completedCount: unitCompleted,
              progress: topics.length ? Math.round((unitCompleted / topics.length) * 100) : 0,
              topics,
            };
          });

        const overallProgress = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

        return {
          id: s.id,
          name: s.title,
          code: s.code || 'CS701',
          university: s.university || 'Engineering Curriculum',
          department: 'CSE / IT',
          semester: 'Current Semester',
          description: `Syllabus: ${s.title}`,
          rawText: s.raw_text,
          status: s.status,
          unitsCount: units.length,
          topicsCount: totalTopics,
          completedTopics,
          progress: overallProgress,
          lastStudied: 'Recently',
          units,
        };
      });
    } catch (error) {
      console.error('Error fetching user syllabi from Supabase:', error.message);
      return this.getSubjects();
    }
  },

  /**
   * Get detail for a single syllabus
   */
  async getSubjectById(subjectId, userId) {
    if (!isSupabaseConfigured() || !userId) {
      const subjects = this.getSubjects();
      return subjects.find((s) => s.id === subjectId) || null;
    }

    const syllabi = await this.getUserSyllabi(userId);
    return syllabi.find((s) => s.id === subjectId) || null;
  },

  /**
   * Toggle topic completion in Supabase and recalculate progress
   */
  async toggleTopicCompletion(subjectId, topicId, userId) {
    if (!isSupabaseConfigured() || !userId) {
      return this.toggleTopicCompletionLocal(subjectId, topicId);
    }

    try {
      // 1. Fetch current topic completion status
      const { data: topic, error: fetchErr } = await supabase
        .from('topics')
        .select('completed')
        .eq('id', topicId)
        .single();

      if (fetchErr) {
        return this.toggleTopicCompletionLocal(subjectId, topicId);
      }

      const nextCompleted = !topic.completed;

      // 2. Update status in database
      const { error: updateErr } = await supabase
        .from('topics')
        .update({ completed: nextCompleted, updated_at: new Date().toISOString() })
        .eq('id', topicId);

      if (updateErr) throw updateErr;

      // 3. Re-fetch updated user syllabi to recalculate dynamic metrics
      const updatedSubjects = await this.getUserSyllabi(userId);

      return {
        success: true,
        completed: nextCompleted,
        subjects: updatedSubjects,
      };
    } catch (error) {
      console.error('Error toggling topic completion in Supabase:', error.message);
      return this.toggleTopicCompletionLocal(subjectId, topicId);
    }
  },

  /**
   * Local storage fallback helpers
   */
  getSubjects() {
    const saved = localStorage.getItem(LOCAL_SUBJECTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return subjectsData;
      }
    }
    return subjectsData;
  },

  saveSubjects(subjects) {
    localStorage.setItem(LOCAL_SUBJECTS_KEY, JSON.stringify(subjects));
  },

  toggleTopicCompletionLocal(subjectId, topicId) {
    const subjects = this.getSubjects();
    let updatedStatus = false;

    const updatedSubjects = subjects.map((subject) => {
      if (subject.id === subjectId) {
        let totalTopics = 0;
        let completedTopics = 0;

        const updatedUnits = subject.units.map((unit) => {
          let unitCompleted = 0;
          const updatedTopics = unit.topics.map((topic) => {
            if (topic.id === topicId) {
              const newCompleted = !topic.completed;
              updatedStatus = newCompleted;
              if (newCompleted) unitCompleted++;
              return { ...topic, completed: newCompleted };
            }
            if (topic.completed) unitCompleted++;
            return topic;
          });

          totalTopics += unit.topics.length;
          completedTopics += unitCompleted;

          return {
            ...unit,
            topics: updatedTopics,
            completedCount: unitCompleted,
            progress: Math.round((unitCompleted / (unit.topics.length || 1)) * 100),
          };
        });

        return {
          ...subject,
          units: updatedUnits,
          completedTopics,
          progress: Math.round((completedTopics / (totalTopics || 1)) * 100),
          lastStudied: 'Just now',
        };
      }
      return subject;
    });

    this.saveSubjects(updatedSubjects);
    return { success: true, completed: updatedStatus, subjects: updatedSubjects };
  },

  async getTopicDetail(subjectId, topicId, userId) {
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (richTopicContents[topicId]) {
      return richTopicContents[topicId];
    }

    let foundTopic = null;
    let subject = null;
    let unitTitle = 'Unit Module';
    let unitNum = 1;

    if (isSupabaseConfigured() && userId) {
      const userSyllabi = await this.getUserSyllabi(userId);
      subject = userSyllabi.find((s) => s.id === subjectId);
    } else {
      const subjects = this.getSubjects();
      subject = subjects.find((s) => s.id === subjectId);
    }

    if (subject && subject.units) {
      for (const unit of subject.units) {
        const found = unit.topics.find((t) => t.id === topicId);
        if (found) {
          foundTopic = found;
          unitTitle = unit.title;
          unitNum = unit.unitNumber;
          break;
        }
      }
    }

    const topicName = foundTopic?.name || 'Topic Overview';
    const isCompleted = foundTopic?.completed || false;
    const learningObjs = foundTopic?.learningObjectives?.length
      ? foundTopic.learningObjectives
      : [
          `Understand core principles and theoretical foundations of ${topicName}.`,
          'Identify practical engineering implementations and industry standards.',
          'Analyze trade-offs, algorithms, and architectural implications.',
          'Prepare for university theoretical examination questions and viva discussions.',
        ];

    const keyConceptsList = foundTopic?.subtopics?.length
      ? foundTopic.subtopics.map((st) => ({
          title: st,
          content: `Fundamental theoretical concepts, algorithms, and models associated with ${st}.`,
        }))
      : [
          {
            title: 'Core Fundamentals',
            content: 'Foundational axioms, mathematical formulations, and operational boundaries necessary for system execution.',
          },
          {
            title: 'Execution Workflow',
            content: 'Step-by-step state transitions and input-to-output data pipelines utilized during production runtime.',
          },
          {
            title: 'Practical Trade-offs',
            content: 'Balancing algorithmic time complexity, space overhead, resource contention, and fault tolerance.',
          },
        ];

    return {
      id: topicId,
      subjectId: subjectId,
      subjectName: subject?.name || 'Computer Science',
      unitNumber: unitNum,
      unitTitle: unitTitle,
      title: topicName.replace(/^\d+\.\s*/, ''),
      difficulty: foundTopic?.difficulty || 'Intermediate',
      estimatedTime: foundTopic?.estimatedTime || `${foundTopic?.estimatedMinutes || 30} min`,
      progress: isCompleted ? 100 : 30,
      completed: isCompleted,
      learningObjectives: learningObjs,
      overview: foundTopic?.description || `${topicName} is an essential module in the ${subject?.name || 'Computer Science'} curriculum. It provides fundamental models and techniques used in modern software engineering and systems design.`,
      keyConcepts: keyConceptsList,
      layers: null,
      howItWorks: `1. System initializes with base parameters and verifies incoming schema.\n2. Processing pipeline parses inputs and executes core algorithmic routines.\n3. Output data structures are populated and verified against boundary conditions.\n4. Telemetry and state changes are propagated to higher abstraction layers.`,
      realWorldExample: {
        title: 'Industrial Production Architecture',
        content: `In high-scale enterprise systems, ${topicName} principles prevent cascading failures, optimize CPU cycles, and ensure robust distributed consistency across cloud clusters.`,
      },
      examTips: [
        '💡 Always draw clear block diagrams and flowcharts in descriptive exam answers.',
        '💡 Highlight time and space complexity with Big-O notation.',
        '💡 Mention real-world protocols or RFC standards to score maximum marks.',
      ],
      keyTerms: [
        { term: 'Throughput', definition: 'Rate of successful data processing per time unit.' },
        { term: 'Latency', definition: 'Time delay between stimulus and response in a system.' },
        { term: 'Idempotency', definition: 'An operation that can be applied multiple times without altering the result beyond the initial execution.' },
      ],
      videos: [
        {
          id: `v-${topicId}-1`,
          title: `${topicName} - Full Concept & Exam Revision`,
          channel: 'Gate Smashers',
          duration: '19:40',
          views: '1.2M views',
          difficulty: 'Beginner',
          thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
          videoUrl: 'https://www.youtube.com/watch?v=0BopgP-i5oU',
          videoId: '0BopgP-i5oU',
          description: 'Detailed explanation with solved university questions and visual diagrams.',
        },
        {
          id: `v-${topicId}-2`,
          title: `${topicName} Deep Dive & Architecture`,
          channel: 'freeCodeCamp.org',
          duration: '32:10',
          views: '840K views',
          difficulty: 'Intermediate',
          thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
          videoUrl: 'https://www.youtube.com/watch?v=vv4y_uOneC0',
          videoId: 'vv4y_uOneC0',
          description: 'Engineering breakdown with code demonstrations and production considerations.',
        },
      ],
      prevTopicId: null,
      nextTopicId: null,
    };
  },
};

export default syllabusService;
