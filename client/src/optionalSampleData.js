export const optionalSampleData = {
  'banana-leaf-spot': {
    knowledgeMatch: { id: 'banana-leaf-spot', name: 'Banana leaf spot' },
    secondOpinion: { source: 'roboflow', crop: 'banana', label: 'Leaf spot', confidence: 0.82 },
    secondOpinions: [
      { source: 'roboflow', model: 'banana-leaf-disease', crop: 'banana', label: 'Leaf spot', confidence: 0.82 },
    ],
    agreement: 'agree',
    note: {
      bisaya: 'Nagkaduol ang resulta sa duha ka pagsusi sa posibleng kondisyon.',
      filipino: 'Magkalapit ang resulta ng dalawang pagsusuri sa posibleng kondisyon.',
    },
  },
}
